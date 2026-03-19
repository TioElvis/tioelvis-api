import { Model } from 'mongoose';
import { Octokit } from '@octokit/rest';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { IGNORED_PATHS } from 'src/lib/constants';
import { Project, ProjectDocument } from '../project/project.schema';

@Injectable()
export class GithubService implements OnModuleInit {
  private owner: string;
  private octokit: Octokit;

  constructor(
    private configService: ConfigService,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  onModuleInit() {
    this.octokit = new Octokit({
      auth: this.configService.get<string>('GITHUB_TOKEN'),
    });
    this.owner = this.configService.get<string>('GITHUB_OWNER')!;
  }

  async findAllRepos() {
    try {
      const { data: repos } =
        await this.octokit.repos.listForAuthenticatedUser();

      const repoUrls = repos.map((repo) => repo.html_url);

      const existingProjects = await this.projectModel
        .find(
          { repositoryUrl: { $in: repoUrls } },
          { repositoryUrl: 1, _id: 1, slug: 1 },
        )
        .lean()
        .exec();

      const projectsMap = new Map(
        existingProjects.map((p) => [
          p.repositoryUrl,
          { _id: p._id, slug: p.slug },
        ]),
      );

      return {
        message: 'Repositories fetched successfully.',
        data: repos.map((repo) => ({
          name: repo.name,
          description: repo.description,
          owner: repo.owner.login,
          url: repo.html_url,
          isPublished: projectsMap.has(repo.html_url),
          _id: projectsMap.get(repo.html_url)?._id,
          slug: projectsMap.get(repo.html_url)?.slug,
        })),
      };
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw new BadRequestException('Failed to fetch repositories.');
    }
  }

  private async findRepoByName(name: string) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner: this.owner,
        repo: name,
      });

      return {
        message: 'Repository found successfully.',
        data: {
          name: data.name,
          description: data.description,
          defaultBranch: data.default_branch,
          owner: data.owner.login,
          url: data.html_url,
        },
      };
    } catch (error) {
      console.error('Error searching repository:', error);
      throw new BadRequestException('Failed to search repository.');
    }
  }

  private async findRepoFileContent(name: string, path: string) {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: name,
        path,
      });

      if (!('content' in data)) {
        throw new BadRequestException('File content not found.');
      }

      const content = Buffer.from(data.content, 'base64').toString('utf-8');

      return {
        message: 'Repository file content found successfully.',
        data: content,
      };
    } catch (error) {
      console.error('Error fetching repository file content:', error);
      throw new BadRequestException('Failed to fetch repository file content.');
    }
  }

  async findRepoFiles(name: string) {
    const { data: repo } = await this.findRepoByName(name);

    try {
      const { data } = await this.octokit.rest.git.getTree({
        owner: this.owner,
        repo: repo.name,
        tree_sha: repo.defaultBranch,
        recursive: '1',
      });

      const paths = data.tree
        .filter((item) => item.type === 'blob')
        .map((item) => item.path)
        .filter(
          (path) => !IGNORED_PATHS.some((ignored) => path?.startsWith(ignored)),
        );

      const files = await Promise.all(
        paths.map(async (path) => {
          const { data: content } = path
            ? await this.findRepoFileContent(name, path)
            : { data: '' };

          return { path, content };
        }),
      );

      return {
        message: 'Repository files found successfully.',
        data: { ...repo, files },
      };
    } catch (error) {
      console.error('Error fetching repository files:', error);
      throw new BadRequestException('Failed to fetch repository files.');
    }
  }
}

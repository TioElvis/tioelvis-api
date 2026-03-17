import { Types } from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { GEMINI_INITIAL_PROMPT } from 'src/lib/constants';
import { Project } from 'src/modules/project/project.schema';
import { GithubService } from 'src/modules/github/github.service';
import { ProjectService } from 'src/modules/project/project.service';
import { SectionService } from 'src/modules/section/section.service';

export interface TSection {
  title: string;
  slug: string;
  content: string;
  sections?: TSection[];
}

@Injectable()
export class GeminiService implements OnModuleInit {
  private genAI: GoogleGenAI;
  private model: string;

  constructor(
    private configService: ConfigService,
    private githubService: GithubService,
    private projectService: ProjectService,
    private sectionService: SectionService,
  ) {}

  onModuleInit() {
    this.genAI = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_KEY'),
    });
    this.model = this.configService.get<string>('GEMINI_MODEL')!;
  }

  private async save(
    sections: TSection[],
    project: Types.ObjectId,
    parent?: Types.ObjectId,
  ) {
    const saved = await Promise.all(
      sections.map((section) =>
        this.sectionService.create({
          title: section.title,
          slug: section.slug,
          content: section.content,
          projectId: project,
          parentId: parent,
        }),
      ),
    );

    const nextLevel = saved
      .map(({ data }, i) => {
        const children = sections[i].sections;

        if (children && children.length > 0) {
          return this.save(children, project, data._id);
        }

        return null;
      })
      .filter((p): p is Promise<void> => p !== null);

    if (nextLevel.length > 0) {
      await Promise.all(nextLevel);
    }
  }

  async generateProject(name: string, additionalPrompt?: string) {
    const files = await this.githubService.findRepoFiles(name);

    const prompt = `${GEMINI_INITIAL_PROMPT}\\n\\nRepository:\\n\\${JSON.stringify(files.data)}${additionalPrompt ? `\\n\\nAdditional Prompt:\\n\\${additionalPrompt}` : ''}`;

    try {
      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });

      const raw = response.text?.trim() ?? '';
      const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');

      const parsed = JSON.parse(cleaned) as {
        project: Project;
        sections: TSection[];
      };

      const { data: project } = await this.projectService.create({
        ...parsed.project,
      });

      await this.save(parsed.sections, project._id);

      return { message: 'Project generated successfully.', data: project };
    } catch (error) {
      console.error('Error generating project:', error);
      throw new BadRequestException('Failed to generate project.');
    }
  }
}

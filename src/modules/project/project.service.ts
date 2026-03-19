import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Project, ProjectDocument } from './project.schema';

import { QueryProjectDto } from './dto/query-project.dio';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';

import { Section, SectionDocument } from 'src/modules/section/section.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
  ) {}

  async create(body: CreateProjectDto) {
    const existingProject = await this.projectModel
      .findOne({ slug: body.slug })
      .exec();

    if (existingProject) {
      throw new BadRequestException('Project with this slug already exists.');
    }

    const payload: Project = { ...body };

    try {
      const project = await this.projectModel.create(payload);

      return { message: 'Project created successfully.', data: project };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new BadRequestException('Failed to create project');
    }
  }

  async find(query: QueryProjectDto) {
    const filter: Record<string, any> = {};

    if (query.slug) filter.slug = query.slug;

    if (query.title) {
      filter.title = { $regex: query.title, $options: 'i' };
    }

    if (query.languages) filter.languages = { $in: query.languages };

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, query.limit ?? 10);
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.projectModel
          .find(filter, { sections: 0 })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean<Project[]>()
          .exec(),
        this.projectModel.countDocuments(filter).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        message: 'Projects retrieved successfully.',
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          next: page < totalPages ? page + 1 : null,
          prev: page > 1 ? page - 1 : null,
        },
      };
    } catch (error) {
      console.error('Error finding projects:', error);
      throw new BadRequestException('Failed to find projects.');
    }
  }

  private buildTree(sections: SectionDocument[], parent?: Types.ObjectId) {
    const children = sections.filter((section) => {
      if (!section.parent && !parent) return true;

      if (section.parent instanceof Types.ObjectId) {
        return String(section.parent) === String(parent);
      }

      return false;
    });

    const tree: Section[] = children.map((child) => {
      const data = this.buildTree(sections, child._id);

      return {
        ...child.toObject(),
        sections: data.length > 0 ? data : undefined,
      };
    });

    return tree;
  }

  private async findSections(projectId: Types.ObjectId) {
    try {
      return await this.sectionModel
        .find({ project: projectId })
        .sort({ order: 1 })
        .exec();
    } catch (error) {
      console.error('Error finding sections:', error);
      throw new Error('Failed to find sections.', { cause: error });
    }
  }

  private async findById(id: Types.ObjectId) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project id.');
    }

    const project = await this.projectModel.findById(id).exec();

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return { message: 'Project retrieved successfully.', data: project };
  }

  async findBySlug(slug: string) {
    const project = await this.projectModel.findOne({ slug }).exec();

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const data = this.buildTree(await this.findSections(project._id));

    return {
      message: 'Project retrieved successfully.',
      data: { project, sections: data.length > 0 ? data : undefined },
    };
  }

  async update(id: Types.ObjectId, body: UpdateProjectDto) {
    const { data: project } = await this.findById(id);

    if (body.slug && body.slug !== project.slug) {
      const existingProject = await this.projectModel
        .findOne({ slug: body.slug, _id: { $ne: id } })
        .exec();

      if (existingProject) {
        throw new BadRequestException('Project with this slug already exists.');
      }
    }

    try {
      await project.updateOne({ $set: body }, { runValidators: true });

      return { message: 'Project updated successfully.' };
    } catch (error) {
      console.error('Error updating project:', error);
      throw new BadRequestException('Failed to update project.');
    }
  }

  async delete(id: Types.ObjectId) {
    const { data: project } = await this.findById(id);

    try {
      await Promise.all([
        this.sectionModel.deleteMany({ project: project._id }),
        project.deleteOne(),
      ]);

      return { message: 'Project deleted successfully.' };
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new BadRequestException('Failed to delete project.');
    }
  }
}

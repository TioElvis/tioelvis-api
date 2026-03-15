import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Section, SectionDocument } from './section.schema';

import { QuerySectionDto } from './dto/query-section.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

import { Project, ProjectDocument } from 'src/modules/project/project.schema';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(body: CreateSectionDto) {
    const projectId = new Types.ObjectId(body.projectId);

    const project = await this.projectModel
      .findById(projectId)
      .select({ _id: 1 })
      .lean()
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const parentId = body.parentId
      ? new Types.ObjectId(body.parentId)
      : undefined;

    const existingSection = await this.sectionModel.findOne({
      slug: body.slug,
      project: projectId,
      parent: parentId,
    });

    if (existingSection) {
      throw new BadRequestException(
        'A section with this slug already exists at the same level.',
      );
    }

    const lastSection = await this.sectionModel
      .findOne({
        project: projectId,
        parent: parentId,
      })
      .sort({ order: -1 })
      .select({ order: 1 })
      .lean()
      .exec();

    const nextOrder = lastSection ? lastSection.order + 1 : 0;

    const payload: Section = {
      ...body,
      order: nextOrder,
      project: projectId,
      parent: parentId,
    };

    const section = new this.sectionModel(payload);

    if (body.parentId) {
      const { data: parent } = await this.findById(body.parentId);

      if (parent?.slug === body.slug) {
        throw new BadRequestException(
          'Parent have the same slug as the new section.',
        );
      }
    }

    try {
      await section.save();

      return { message: 'Section created successfully.', data: section };
    } catch (error) {
      console.error('Error creating section:', error);
      throw new BadRequestException('Failed to create section.');
    }
  }

  private async findById(id: Types.ObjectId) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid section id.');
    }

    const section = await this.sectionModel.findById(id).exec();

    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    return { message: 'Section found.', data: section };
  }

  async find(query: QuerySectionDto) {
    const project = await this.projectModel
      .findOne({ slug: query.project })
      .select({ _id: 1 })
      .lean()
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (query.parent) {
      const parent = await this.sectionModel
        .findOne({
          slug: query.parent,
          project: project._id,
        })
        .select({ _id: 1 })
        .lean()
        .exec();

      if (!parent) {
        throw new NotFoundException('Parent section not found.');
      }

      const section = await this.sectionModel
        .findOne({ project: project._id, parent: parent._id, slug: query.slug })
        .lean()
        .exec();

      return { message: 'Section found.', data: section };
    }

    const section = await this.sectionModel
      .findOne({ project: project._id, slug: query.slug })
      .lean()
      .exec();

    return { message: 'Section found.', data: section };
  }

  async update(id: Types.ObjectId, body: UpdateSectionDto) {
    const { data: section } = await this.findById(id);

    if (body.slug) {
      const existingSection = await this.sectionModel.findOne({
        slug: body.slug,
        project: section.project,
        parent: section.parent ?? null,
        _id: { $ne: id },
      });

      if (existingSection) {
        throw new BadRequestException(
          'A section with this slug already exists at the same level.',
        );
      }
    }

    try {
      await section.updateOne({ $set: body }, { runValidators: true });

      return { message: 'Section updated successfully.' };
    } catch (error) {
      console.error('Error updating section:', error);
      throw new BadRequestException('Failed to update section.');
    }
  }

  async delete(id: Types.ObjectId) {
    const { data: section } = await this.findById(id);

    try {
      await section.deleteOne();

      const siblings = await this.sectionModel
        .find({
          project: section.project,
          parent: section.parent ?? null,
        })
        .sort({ order: 1 })
        .exec();

      const bulkOps = siblings.map((sibling, index) => ({
        updateOne: {
          filter: { _id: sibling._id },
          update: { $set: { order: index } },
        },
      }));

      if (bulkOps.length > 0) {
        await this.sectionModel.bulkWrite(bulkOps);
      }

      return { message: 'Section deleted successfully.' };
    } catch (error) {
      console.error('Error deleting section:', error);
      throw new BadRequestException('Failed to delete section.');
    }
  }
}

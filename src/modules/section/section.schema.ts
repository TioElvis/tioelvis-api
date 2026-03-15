import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Project } from '../project/project.schema';

export type SectionDocument = HydratedDocument<Section>;

@Schema({ timestamps: true })
export class Section {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, required: true })
  content: string; // Markdown content

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
  project: Types.ObjectId | Project;

  @Prop({ type: Types.ObjectId, ref: Section.name })
  parent?: Types.ObjectId | Section;
}

export const SectionSchema = SchemaFactory.createForClass(Section);

SectionSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function () {
    const SectionModel = this.model(Section.name);

    await SectionModel.deleteMany({ project: this.project, parent: this._id });
  },
);

SectionSchema.index({ parent: 1 });
SectionSchema.index({ project: 1 });
SectionSchema.index({ project: 1, order: 1 });

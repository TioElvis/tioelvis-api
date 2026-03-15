import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ProjectDocument = HydratedDocument<Project>;

export enum Languages {
  TYPESCRIPT = 'TypeScript',
  JAVASCRIPT = 'JavaScript',
  C = 'C',
  GO = 'Go',
  CPP = 'C++',
  RUST = 'Rust',
  JAVA = 'Java',
  PYTHON = 'Python',
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  content: string; // Markdown content

  @Prop({ type: Array, required: true, enum: Languages })
  languages: Languages[];

  @Prop({ type: String })
  repositoryUrl?: string;

  @Prop({ type: String })
  demoUrl?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

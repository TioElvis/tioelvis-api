import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { Section, SectionSchema } from './section.schema';

import { Project, ProjectSchema } from 'src/modules/project/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Section.name, schema: SectionSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [SectionController],
  providers: [SectionService],
  exports: [SectionService],
})
export class SectionModule {}

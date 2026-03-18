import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GithubService } from './github.service';
import { GithubController } from './github.controller';

import { Project, ProjectSchema } from '../project/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}

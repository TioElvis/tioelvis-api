import { Module } from '@nestjs/common';

import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';

import { GithubModule } from 'src/modules/github/github.module';
import { ProjectModule } from 'src/modules/project/project.module';
import { SectionModule } from 'src/modules/section/section.module';

@Module({
  imports: [GithubModule, ProjectModule, SectionModule],
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}

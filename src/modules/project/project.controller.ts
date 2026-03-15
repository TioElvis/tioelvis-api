import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';

import { ProjectService } from './project.service';

import { QueryProjectDto } from './dto/query-project.dio';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('find')
  async find(@Query() query: QueryProjectDto) {
    return await this.projectService.find(query);
  }

  @Get('find-by-slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return await this.projectService.findBySlug(slug);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() body: UpdateProjectDto,
  ) {
    return await this.projectService.update(id, body);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: Types.ObjectId) {
    return await this.projectService.delete(id);
  }
}

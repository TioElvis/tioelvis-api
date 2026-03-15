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

import { SectionService } from './section.service';

import { QuerySectionDto } from './dto/query-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get('find')
  async find(@Query() query: QuerySectionDto) {
    return await this.sectionService.find(query);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() body: UpdateSectionDto,
  ) {
    return await this.sectionService.update(id, body);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: Types.ObjectId) {
    return await this.sectionService.delete(id);
  }
}

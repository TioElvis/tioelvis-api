import { AuthGuard } from '@nestjs/passport';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { GeminiService } from './gemini.service';
import { GenerateProjectDto } from './dto/generate-project.dto';

@Controller('gemini')
@UseGuards(AuthGuard('jwt'))
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate')
  async generate(@Body() body: GenerateProjectDto) {
    return await this.geminiService.generateProject(
      body.name,
      body.additionalPrompt,
    );
  }
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  additionalPrompt?: string;
}

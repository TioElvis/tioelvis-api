import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class QuerySectionDto {
  /* [SLUG FILTERING ATTRIBUTES] */

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  project: string;

  @IsOptional()
  @IsString()
  parent?: string;
}

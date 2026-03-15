import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

import { Languages } from '../project.schema';

export class QueryProjectDto {
  /* [FILTERING ATTRIBUTES] */

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return (Array.isArray(value) ? value : [value]) as Languages[];
  })
  @IsEnum(Languages, { each: true })
  languages?: Languages[];

  /* [QUERY OPTIONS] */

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

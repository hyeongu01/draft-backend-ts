import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@/prisma/client';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateResumeDto {
  @ApiPropertyOptional()
  @MaxLength(255)
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @MaxLength(1000)
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  content?: Prisma.InputJsonValue;

  @ApiPropertyOptional()
  @Max(100)
  @Min(0)
  @IsInt()
  @IsOptional()
  careerYears?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @Min(1)
  @IsInt()
  @IsOptional()
  categoryId?: number;
}

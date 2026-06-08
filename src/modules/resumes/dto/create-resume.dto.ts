import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { InputJsonValue } from '@prisma/client/runtime/client';

export class CreateResumeDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  content: InputJsonValue;

  @ApiPropertyOptional()
  @Min(0)
  @IsInt()
  @IsOptional()
  careerYears?: number;
}

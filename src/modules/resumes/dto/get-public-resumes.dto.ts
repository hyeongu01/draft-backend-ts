import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Type } from 'class-transformer';

export class GetPublicResumesDto extends PaginationDto {
  @ApiPropertyOptional({ description: '카테고리 그룹 필터' })
  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  groupId?: number;

  @ApiPropertyOptional()
  @Min(0)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  minCareerYear?: number;

  @ApiPropertyOptional()
  @Min(0)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  maxCareerYear?: number;
}

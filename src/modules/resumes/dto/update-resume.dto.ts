import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResumeDto {
  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  categoryId: number;

  @ApiProperty()
  isPublic: boolean;
}

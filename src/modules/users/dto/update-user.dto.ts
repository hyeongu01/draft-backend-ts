import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';
import {
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @Length(2, 100)
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description:
      'null 으로 주입하면 기존의 프로필 삭제하고 기본 프로필 이미지로 변경함',
  })
  @IsUrl()
  @MaxLength(255)
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  profileImageUrl?: string | null;
}

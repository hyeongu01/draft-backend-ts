import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleCallbackDto {
  @ApiProperty({ description: '구글 OAuth 인가 코드' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @Length(2, 100)
  @IsString()
  @IsOptional()
  nickname?: string;
}

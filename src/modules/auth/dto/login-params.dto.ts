import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginParamsDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;
}

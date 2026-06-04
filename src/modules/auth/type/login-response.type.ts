import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseType {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

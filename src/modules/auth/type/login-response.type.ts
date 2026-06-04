import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseType {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

// refreshToken 은 HttpOnly 쿠키로 내려가므로 응답 바디엔 accessToken 만 노출
export class AccessTokenResponseType {
  @ApiProperty()
  accessToken: string;
}

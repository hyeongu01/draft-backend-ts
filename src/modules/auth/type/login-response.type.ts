import { ApiProperty } from '@nestjs/swagger';
import { UserResponseType } from '@/modules/users/type/user-response.type';
import { User } from '@/prisma/client';

export class LoginResponseType {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// refreshToken 은 HttpOnly 쿠키로 내려가므로 응답 바디엔 accessToken 만 노출
export class AccessTokenResponseType {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: UserResponseType;
}

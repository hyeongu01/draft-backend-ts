import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@/prisma/client';

export class PublicUserResponseType {
  @ApiProperty()
  nickname: string;

  static fromUser(item: User): PublicUserResponseType {
    return {
      nickname: item.nickname || 'unknown',
    };
  }
}

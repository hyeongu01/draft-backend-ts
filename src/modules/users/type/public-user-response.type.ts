import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@/prisma/client';

export class PublicUserResponseType {
  @ApiProperty()
  nickname: string;

  @ApiProperty({ type: 'string', nullable: true })
  profileImageUrl: string | null;

  static fromUser(item: User): PublicUserResponseType {
    return {
      nickname: item.nickname || 'unknown',
      profileImageUrl: item.profileImageUrl,
    };
  }
}

import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/prisma/client';

export class UserResponseType {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: 'string', nullable: true })
  nickname: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: DateFormatObject })
  createdAt: DateFormatObject;

  @ApiProperty({ type: DateFormatObject })
  updatedAt: DateFormatObject;

  static fromUser(user: User) {
    return {
      id: user.id,
      nickname: user.nickname,
      name: user.name,
      email: user.email,
      createdAt: dateToDateFormatObject(user.createdAt),
      updatedAt: dateToDateFormatObject(user.updatedAt),
    };
  }
}

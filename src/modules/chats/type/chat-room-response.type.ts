import { ApiProperty } from '@nestjs/swagger';
import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import {
  type ChatRoomListItem,
  type OpponentUser,
} from '@/modules/chats/chats.type';

export class OpponentResponseType implements OpponentUser {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: 'string', nullable: true, description: '유저 닉네임' })
  nickname: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
    description: '유저 프로필 이미지 url',
  })
  profileImageUrl: string | null;
}

export class ChatRoomResponseType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: DateFormatObject;

  @ApiProperty({ type: DateFormatObject })
  lastMessagedAt: DateFormatObject;

  @ApiProperty({ type: 'string', nullable: true })
  lastMessageSnapshot: string | null;

  @ApiProperty()
  opponent: OpponentResponseType;

  @ApiProperty()
  unreadCount: number;

  static fromChatRoomListItem(
    item: ChatRoomListItem,
    userId: string,
  ): ChatRoomResponseType {
    return {
      id: item.id,
      createdAt: dateToDateFormatObject(item.createdAt),
      lastMessagedAt: dateToDateFormatObject(item.lastMessagedAt),
      lastMessageSnapshot: item.lastMessageSnapshot,
      opponent: item.participants.find((p) => p.userId !== userId)!.user,
      unreadCount: item.unreadCount,
    };
  }
}

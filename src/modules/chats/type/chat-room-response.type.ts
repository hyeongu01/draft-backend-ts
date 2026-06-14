import { ApiProperty } from '@nestjs/swagger';
import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import {
  type ChatRoomListItem,
  type OpponentUser,
} from '@/modules/chats/chats.type';

class OpponentResponseType implements OpponentUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nickname: string | null;

  @ApiProperty()
  profileImageUrl: string | null;
}

export class ChatRoomResponseType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: DateFormatObject;

  @ApiProperty()
  updatedAt: DateFormatObject;

  @ApiProperty()
  opponent: OpponentResponseType;

  static fromChatRoomListItem(
    item: ChatRoomListItem,
    userId: string,
  ): ChatRoomResponseType {
    return {
      id: item.id,
      createdAt: dateToDateFormatObject(item.createdAt),
      updatedAt: dateToDateFormatObject(item.updatedAt),
      opponent: item.participants.filter((p) => p.userId !== userId)[0].user,
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { DateFormatObject, dateToDateFormatObject } from '@/common/date-format';
import { OpponentResponseType } from '@/modules/chats/type/chat-room-response.type';
import { ChatRoomDetail } from '@/modules/chats/chats.type';

export class ChatMessageResponse {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  roomId: string;

  @ApiProperty()
  createdAt: DateFormatObject;
}

export class ChatRoomDetailResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: DateFormatObject;

  @ApiProperty()
  lastMessagedAt: DateFormatObject;

  @ApiProperty({ type: 'string', nullable: true })
  lastMessageSnapshot: string | null;

  @ApiProperty({ type: [ChatMessageResponse] })
  chatMessages: ChatMessageResponse[];

  @ApiProperty()
  opponent: OpponentResponseType;

  static fromChatRoom(
    userId: string,
    item: ChatRoomDetail,
  ): ChatRoomDetailResponse {
    return {
      id: item.id,
      createdAt: dateToDateFormatObject(item.createdAt),
      lastMessagedAt: dateToDateFormatObject(item.lastMessagedAt),
      lastMessageSnapshot: item.lastMessageSnapshot,
      chatMessages: item.chatMessages.map((m) => ({
        ...m,
        createdAt: dateToDateFormatObject(m.createdAt),
      })),
      opponent: item.participants.find((p) => p.userId !== userId)!.user,
    };
  }
}

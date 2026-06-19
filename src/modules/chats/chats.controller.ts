import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ChatsService } from '@/modules/chats/chats.service';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import type { User } from '@/prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateChatRoomDto } from '@/modules/chats/dto/create-chat-room.dto';
import {
  ResponsePaginatedSuccess,
  ResponseSuccess,
} from '@/common/types/response.type';
import { CreateChatRoomResponseType } from '@/modules/chats/type/create-chat-room-response.type';
import { ApiResponsePaginatedSuccess } from '@/common/decorators/api-response-paginated-success.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ChatRoomResponseType } from '@/modules/chats/type/chat-room-response.type';
import { CreateChatMessageDto } from '@/modules/chats/dto/create-chat-message.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'create a chat room',
    description:
      '이력서(resumeId)의 작성자와 1:1 채팅방을 생성하고 방 id 를 반환합니다. 인증이 필요합니다. ' +
      '동일한 두 유저 사이에는 방이 하나만 존재하므로, 이미 방이 있으면 새로 만들지 않고 기존 방의 id 를 반환합니다(멱등). ' +
      '요청자가 이전에 나갔던(leftAt 기록) 방이면 재입장 처리되며, 이때 joinedAt 이 갱신되어 나가기 이전의 대화 내역은 조회되지 않습니다. ' +
      '대상 이력서는 공개(isPublic=true)·미삭제(soft delete 제외) 상태여야 하며, 이력서나 그 작성자를 찾을 수 없으면 404, 본인 이력서로 채팅을 시도하면 400 을 반환합니다. ' +
      'resumeId 는 26자 ULID 형식이어야 합니다.',
  })
  @ApiResponseSuccess(CreateChatRoomResponseType)
  @ApiBadRequestResponse({ description: '본인과는 채팅을 할 수 없습니다.' })
  @ApiNotFoundResponse({
    description: '비공개, 삭제 이력서 또는 그 작성자를 찾을 수 없음 ',
  })
  async createChatRoom(
    @CurrentUser() user: User,
    @Body() createChatRoomDto: CreateChatRoomDto,
  ): Promise<ResponseSuccess<CreateChatRoomResponseType>> {
    const roomId: string = await this.chatsService.createChatRoom(
      user,
      createChatRoomDto,
    );
    return ResponseSuccess.ok({ roomId });
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 채팅방 목록 조회',
    description:
      '로그인 유저가 참여 중인 (나가지 않음, leftAt=null) 채팅방을 페이지네이션으로 조회.' +
      '최근 생성순(createdAt desc) 으로 정렬되며, 각 방에는 상대방 (opponent) 정보가 포함된다.',
  })
  @ApiResponsePaginatedSuccess(ChatRoomResponseType)
  async getMyChatRooms(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    const { items, total } = await this.chatsService.findAllChatRooms(
      user,
      paginationDto,
    );
    return new ResponsePaginatedSuccess<ChatRoomResponseType>(
      items.map((item) =>
        ChatRoomResponseType.fromChatRoomListItem(item, user.id),
      ),
      { ...paginationDto, total },
    );
  }

  @Post('messages')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'create a chat message',
    description:
      '채팅방(roomId)에 메시지를 전송합니다. 인증이 필요합니다. ' +
      '요청자가 해당 방의 참여자가 아니면 404 를 반환합니다. ' +
      '전송 시 방의 lastMessagedAt 이 현재 시각으로, lastMessageSnapshot 이 메시지 앞 255자로 갱신됩니다. ' +
      '방에서 나갔던(leftAt 기록) 참여자는 재참여 처리되어 joinedAt 이 갱신되고 leftAt·lastReadAt 이 초기화됩니다(상대방이 다시 목록에서 방을 볼 수 있게 됨). ' +
      'message 는 2자 이상 5000자 이하여야 하고, roomId 는 26자 ULID 형식이어야 합니다.',
  })
  @ApiResponseSuccess()
  @ApiNotFoundResponse({ description: '채팅방을 찾을 수 없습니다.' })
  async createChatMessage(
    @CurrentUser() user: User,
    @Body() createChatMessageDto: CreateChatMessageDto,
  ) {
    await this.chatsService.createChatMessage(user, createChatMessageDto);
    return ResponseSuccess.ok({});
  }
}

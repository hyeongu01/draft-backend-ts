import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma/prisma.service';
import { CreateChatRoomDto } from '@/modules/chats/dto/create-chat-room.dto';
import { ChatRoom, Prisma, User } from '@/prisma/client';
import {
  chatRoomListInclude,
  ChatRoomListItem,
} from '@/modules/chats/chats.type';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateChatMessageDto } from '@/modules/chats/dto/create-chat-message.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createChatRoom(
    user: User,
    { resumeId }: CreateChatRoomDto,
  ): Promise<string> {
    const { user: targetUser } = (await this.prismaService.resume.findUnique({
      where: { id: resumeId, deletedAt: null, isPublic: true },
      select: { user: true },
    })) ?? { user: null };
    if (!targetUser || targetUser.deletedAt !== null)
      throw new NotFoundException('이력서 작성자를 찾을 수 없습니다.');
    if (targetUser.id === user.id)
      throw new BadRequestException('본인과의 채팅은 할 수 없습니다.');

    const targetUserId = targetUser.id.toUpperCase();
    const userId = user.id.toUpperCase();
    const pairKey: string =
      targetUserId < userId
        ? `${targetUserId}:${userId}`
        : `${userId}:${targetUserId}`;

    try {
      const room: ChatRoom = await this.prismaService.chatRoom.create({
        data: {
          pairKey,
          participants: {
            createMany: {
              data: [{ userId: user.id }, { userId: targetUser.id }],
            },
          },
        },
      });
      return room.id;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const room: ChatRoom =
          await this.prismaService.chatRoom.findUniqueOrThrow({
            where: { pairKey },
          });
        // 이미 방 존재하는데, 나간 경우 방을 재참여시킴
        await this.prismaService.chatRoomParticipant.updateMany({
          where: {
            roomId: room.id,
            userId: user.id,
            leftAt: { not: null },
          },
          data: { leftAt: null, joinedAt: new Date(), lastReadAt: null },
        });
        return room.id;
      }
      throw e;
    }
  }

  async findAllChatRooms(
    user: User,
    { page, limit, sort, order }: PaginationDto,
  ): Promise<{ items: ChatRoomListItem[]; total: number }> {
    const chatRoomWhereOptions = {
      participants: {
        some: { userId: user.id, leftAt: null },
      },
    } satisfies Prisma.ChatRoomWhereInput;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.chatRoom.findMany({
        where: chatRoomWhereOptions,
        include: chatRoomListInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
      }),
      this.prismaService.chatRoom.count({
        where: chatRoomWhereOptions,
      }),
    ]);
    const itemsWithUnread = await Promise.all(
      items.map(async (room) => {
        const me = room.participants.find((p) => p.userId === user.id)!;
        const since = me.lastReadAt ?? me.joinedAt;
        const unreadCount = await this.prismaService.chatMessage.count({
          where: {
            roomId: room.id,
            userId: { not: user.id },
            createdAt: since ? { gt: since } : undefined,
          },
        });
        return { ...room, unreadCount };
      }),
    );
    return { items: itemsWithUnread, total };
  }

  async createChatMessage(
    user: User,
    createChatMessageDto: CreateChatMessageDto,
  ) {
    const now: Date = new Date();
    const room = await this.prismaService.chatRoom.findUnique({
      where: {
        id: createChatMessageDto.roomId,
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
    });
    if (!room) throw new NotFoundException('채팅방을 찾을 수 없습니다.');

    await this.prismaService.$transaction([
      this.prismaService.chatRoom.update({
        where: {
          id: createChatMessageDto.roomId,
        },
        data: {
          lastMessagedAt: now,
          lastMessageSnapshot: createChatMessageDto.message.slice(0, 255),
        },
      }),
      this.prismaService.chatMessage.create({
        data: {
          userId: user.id,
          content: createChatMessageDto.message,
          roomId: createChatMessageDto.roomId,
        },
      }),
      this.prismaService.chatRoomParticipant.updateMany({
        where: {
          roomId: createChatMessageDto.roomId,
          leftAt: { not: null },
        },
        data: {
          joinedAt: now,
          leftAt: null,
          lastReadAt: null,
        },
      }),
    ]);
  }
}

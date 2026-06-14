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
    const whereOptions = {
      participants: {
        some: { userId: user.id, leftAt: null },
      },
    } satisfies Prisma.ChatRoomWhereInput;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.chatRoom.findMany({
        where: whereOptions,
        include: chatRoomListInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
      }),
      this.prismaService.chatRoom.count({
        where: whereOptions,
      }),
    ]);
    return { items, total };
  }
}

import { Prisma } from '@/prisma/client';

export const chatRoomListInclude = {
  participants: {
    include: {
      user: {
        select: { id: true, nickname: true, profileImageUrl: true },
      },
    },
  },
} satisfies Prisma.ChatRoomInclude;

export type ChatRoomListItem = Prisma.ChatRoomGetPayload<{
  include: typeof chatRoomListInclude;
}> & {
  unreadCount: number;
};

export type OpponentUser = {
  id: string;
  nickname: string | null;
  profileImageUrl: string | null;
};

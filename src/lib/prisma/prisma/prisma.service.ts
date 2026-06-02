import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import CONFIG from '@/config/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaMariaDb(CONFIG.DATABASE_URL);
    super({ adapter });
  }
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      console.log(`[Prisma] ${CONFIG.DATABASE_URL} connected`);
    } catch {
      console.error('[Prisma] Failed to connect');
      process.exit(1);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

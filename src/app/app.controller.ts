import { Controller, Get, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { type HealthResponseType } from '@/app/type/health-response.type';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';

@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHello(@Headers('host') host: string): HealthResponseType {
    const uptime = process.uptime();

    return {
      status: 'health',
      host,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    };
  }
}

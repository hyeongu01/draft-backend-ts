import {
  Controller,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ResumeReactionsService } from '@/modules/resumes/resume-reactions.service';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { User } from '@/prisma/client';
import { ResumesService } from '@/modules/resumes/resumes.service';
import { ResponseSuccess } from '@/common/types/response.type';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import { ToggleLikeResponseType } from '@/modules/resumes/type/toggle-like-response.type';
import { ToggleScrapResponseType } from '@/modules/resumes/type/toggle-scrap-response.type';

@ApiTags('Like')
@Controller('resumes')
export class ResumeReactionsController {
  constructor(
    private readonly resumeReactionsService: ResumeReactionsService,
    private readonly resumeService: ResumesService,
  ) {}

  @Post('like/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'toggle like count',
    description:
      '이력서 좋아요를 토글합니다. 누르지 않은 상태면 좋아요가 추가되고, 이미 누른 상태면 취소됩니다. 토글 후의 최종 상태(isLiked)와 좋아요 수(likeCount)를 반환합니다.',
  })
  @ApiResponseSuccess(ToggleLikeResponseType)
  async toggleLike(@CurrentUser() user: User, @Param('id') id: string) {
    const target = await this.resumeService.findPublicItemById(id);
    if (!target) throw new NotFoundException(`이력서를 찾을 수 없습니다.`);

    const data: ToggleLikeResponseType =
      await this.resumeReactionsService.toggleLike(user, id);
    return ResponseSuccess.ok(data);
  }

  @Post('scrap/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'toggle scrap count',
    description:
      '이력서 스크랩을 토글합니다. 스크랩하지 않은 상태면 스크랩이 추가되고, 이미 스크랩한 상태면 취소됩니다. 토글 후의 최종 상태(isScrapped)와 스크랩 수(scrapCount)를 반환합니다.',
  })
  @ApiResponseSuccess(ToggleScrapResponseType)
  async toggleScrap(@CurrentUser() user: User, @Param('id') id: string) {
    const target = await this.resumeService.findPublicItemById(id);
    if (!target) throw new NotFoundException(`이력서를 찾을 수 없습니다.`);

    const data: ToggleScrapResponseType =
      await this.resumeReactionsService.toggleScrap(user, id);
    return ResponseSuccess.ok(data);
  }
}

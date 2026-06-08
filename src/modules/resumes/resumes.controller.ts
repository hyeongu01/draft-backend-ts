import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { CreateResumeDto } from '@/modules/resumes/dto/create-resume.dto';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import { ResponseSuccess } from '@/common/types/response.type';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { User } from '@/prisma/client';
import { ResumesService } from '@/modules/resumes/resumes.service';
import { ResumeResponseType } from '@/modules/resumes/type/resume-response.type';
import { ResumeType } from '@/modules/resumes/resumes.type';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateResumeDto } from '@/modules/resumes/dto/update-resume.dto';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'resume 생성',
    description:
      '로그인한 유저가 새 이력서(resume)를 생성합니다. 작성자(userId)는 인증 토큰에서 자동 지정되며, 생성된 이력서는 비공개(isPublic=false) 상태로 시작합니다. careerYears 와 category(categoryId)는 선택 항목으로, 비워두고 생성한 뒤 수정 API 로 채울 수 있습니다. ' +
      '초기 생성 시 title 과 description 은 빈 문자열("") 또는 초기값으로 두고, content 는 tiptap 의 초기값(빈 document)을 넣어 생성합니다. ' +
      '생성된 이력서를 연결된 category 정보와 함께 반환합니다.',
  })
  @ApiResponseSuccess(ResumeResponseType)
  async createItem(
    @CurrentUser() user: User,
    @Body() createResumeDto: CreateResumeDto,
  ): Promise<ResponseSuccess<ResumeResponseType>> {
    const data: ResumeType<['category']> = await this.resumesService.createItem(
      user,
      createResumeDto,
    );
    return ResponseSuccess.ok(ResumeResponseType.fromResume(data));
  }

  @Put()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ description: '' })
  async updateItem(@Body() updateResumeDto: UpdateResumeDto) {}
}

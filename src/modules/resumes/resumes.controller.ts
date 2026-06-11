import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateResumeDto } from '@/modules/resumes/dto/create-resume.dto';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import {
  ResponsePaginatedSuccess,
  ResponseSuccess,
} from '@/common/types/response.type';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { Resume, User } from '@/prisma/client';
import { ResumesService } from '@/modules/resumes/resumes.service';
import { ResumeResponseType } from '@/modules/resumes/type/resume-response.type';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateResumeDto } from '@/modules/resumes/dto/update-resume.dto';
import { ApiResponsePaginatedSuccess } from '@/common/decorators/api-response-paginated-success.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ResumeItem } from '@/modules/resumes/resumes.type';

@ApiTags('Resumes (private)')
@Controller('me/resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'resume 생성',
    description:
      '로그인한 유저가 새 이력서(resume)를 생성합니다. 작성자(userId)는 인증 토큰에서 자동 지정되며, 생성된 이력서는 비공개(isPublic=false) 상태로 시작합니다. careerYears 는 선택 항목이며, category 는 생성 시 지정할 수 없고 수정 API 로 지정합니다. ' +
      '초기 생성 시 title 과 description 은 빈 문자열("") 또는 초기값으로 두고, content 는 tiptap 의 초기값(빈 document)을 넣어 생성합니다. ' +
      '기획상 최초 생성 시에는 빈 값들로 생성되므로(카테고리도 비어 있음), 응답에 category 객체는 포함되지 않습니다. category 정보는 수정 후 조회 API 를 통해 확인할 수 있습니다.',
  })
  @ApiResponseSuccess(ResumeResponseType)
  async createItem(
    @CurrentUser() user: User,
    @Body() createResumeDto: CreateResumeDto,
  ): Promise<ResponseSuccess<ResumeResponseType>> {
    const data: Resume = await this.resumesService.createItem(
      user,
      createResumeDto,
    );
    return ResponseSuccess.ok(
      ResumeResponseType.fromResume(data as ResumeItem),
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'resume 수정',
    description:
      '본인이 작성한 이력서를 부분 수정합니다. 경로의 id 로 대상을 지정하며, 바디에 전달된 필드만 갱신됩니다(title, description, content, careerYears, isPublic, categoryId 모두 선택 항목). ' +
      '본인 소유가 아니거나 존재하지 않는(이미 삭제된 경우 포함) 이력서면 404 를 반환합니다. ' +
      '※ 현재 비공개→공개(isPublic=true) 전환 시 필수값(title/content 등) 검증은 적용하지 않습니다.',
  })
  @ApiResponseSuccess()
  async updateItem(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ): Promise<ResponseSuccess<{}>> {
    const oldItem = await this.resumesService.findItemById(id);
    if (oldItem?.userId !== user.id)
      throw new NotFoundException('이력서를 찾을 수 없습니다.');

    await this.resumesService.updateItem(id, updateResumeDto);
    return ResponseSuccess.ok({});
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'resume 삭제',
    description:
      '본인이 작성한 이력서를 삭제합니다. 실제 행을 제거하지 않고 deletedAt 을 기록하는 soft delete 방식이라, 데이터는 보존되며 조회에서만 제외됩니다. ' +
      '경로의 id 로 대상을 지정하며, 본인 소유가 아니거나 존재하지 않는(이미 삭제된 경우 포함) 이력서면 404 를 반환합니다.',
  })
  @ApiResponseSuccess()
  async deleteItem(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ResponseSuccess<{}>> {
    const oldItem = await this.resumesService.findItemById(id);
    if (oldItem?.userId !== user.id)
      throw new NotFoundException('이력서를 찾을 수 없습니다.');

    await this.resumesService.deleteItem(id);
    return ResponseSuccess.ok({});
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'resume 전체 조회 (페이지네이션 O)',
    description:
      '로그인한 유저 본인이 작성한 이력서를 페이지네이션하여 목록 조회합니다. 삭제된(soft delete) 이력서는 제외됩니다. ' +
      '페이지·정렬은 쿼리 파라미터(page, limit, sort, order)로 제어하며, 미전달 시 기본값(page=1, limit=10, sort=createdAt, order=desc)이 적용됩니다. ' +
      '각 이력서에는 연결된 category 정보(소속 group 포함)가 함께 반환됩니다. 타 유저의 공개 이력서 조회는 별도의 API 를 사용합니다.',
  })
  @ApiResponsePaginatedSuccess(ResumeResponseType)
  async findAll(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ): Promise<ResponsePaginatedSuccess<ResumeResponseType>> {
    const { items, total }: { items: ResumeItem[]; total: number } =
      await this.resumesService.findAll(user, paginationDto);
    return new ResponsePaginatedSuccess(
      items.map(ResumeResponseType.fromResume),
      {
        ...paginationDto,
        total,
      },
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'resume 단건 조회',
    description:
      '본인이 작성한 이력서 단건을 조회합니다. 연결된 category 정보(소속 group 포함)를 함께 반환합니다. ' +
      '타 유저의 공개 이력서 조회는 별도의 API 를 사용합니다.',
  })
  @ApiResponseSuccess(ResumeResponseType)
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ResponseSuccess<ResumeResponseType>> {
    const item: ResumeItem | null = await this.resumesService.findItemById(id);
    if (item?.userId !== user.id)
      throw new NotFoundException('이력서를 찾을 수 없습니다.');
    return ResponseSuccess.ok(ResumeResponseType.fromResume(item));
  }
}

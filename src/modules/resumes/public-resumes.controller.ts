import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ResumesService } from '@/modules/resumes/resumes.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPublicResumesDto } from '@/modules/resumes/dto/get-public-resumes.dto';
import {
  ResponsePaginatedSuccess,
  ResponseSuccess,
} from '@/common/types/response.type';
import { ResumeResponseType } from '@/modules/resumes/type/resume-response.type';
import { ApiResponsePaginatedSuccess } from '@/common/decorators/api-response-paginated-success.decorator';
import type { ResumeItem } from '@/modules/resumes/resumes.type';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';

@ApiTags('Resumes (public)')
@Controller('public/resumes')
export class PublicResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Get()
  @ApiOperation({
    summary: 'public resumes 전체 조회 (페이지네이션 O)',
    description:
      '공개(isPublic=true)된 이력서를 페이지네이션하여 목록 조회합니다. 인증이 필요 없는 공개 API 이며, 삭제된(soft delete) 이력서는 제외됩니다. ' +
      '경력(careerYears) 범위는 minCareerYear·maxCareerYear 로, 카테고리 그룹은 groupId 로 필터링할 수 있으며 모두 선택 항목입니다(미전달 시 필터 미적용). careerYears 범위 필터를 적용하면 careerYears 가 설정되지 않은 이력서는 결과에서 제외됩니다. ' +
      '페이지·정렬은 쿼리 파라미터(page, limit, sort, order)로 제어하며, 미전달 시 기본값(page=1, limit=10, sort=createdAt, order=desc)이 적용됩니다. ' +
      '각 이력서에는 연결된 category 정보(소속 group 포함)와 작성자 user 정보(nickname)가 함께 반환됩니다. nickname 미설정 시 "unknown" 으로 반환됩니다.',
  })
  @ApiResponsePaginatedSuccess(ResumeResponseType)
  async findAllPublicItems(
    @Query() getPublicResumesDto: GetPublicResumesDto,
  ): Promise<ResponsePaginatedSuccess<ResumeResponseType>> {
    const { items, total } =
      await this.resumesService.findAllPublicItems(getPublicResumesDto);
    return new ResponsePaginatedSuccess(
      items.map(ResumeResponseType.fromResume),
      {
        ...getPublicResumesDto,
        total,
      },
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'public resume 단건 조회',
    description:
      '공개(isPublic=true)된 이력서 단건을 조회합니다. 인증이 필요 없는 공개 API 입니다. ' +
      '경로의 id 로 대상을 지정하며, 존재하지 않거나 비공개·삭제된(soft delete) 이력서면 404 를 반환합니다. ' +
      '연결된 category 정보(소속 group 포함)와 작성자 user 정보(nickname)를 함께 반환합니다. nickname 미설정 시 "unknown" 으로 반환됩니다.',
  })
  @ApiResponseSuccess(ResumeResponseType)
  async findOnePublicItem(
    @Param('id') id: string,
  ): Promise<ResponseSuccess<ResumeResponseType>> {
    const item: ResumeItem | null =
      await this.resumesService.findPublicItemById(id);
    if (!item) throw new NotFoundException('이력서를 찾을 수 없습니다');
    return ResponseSuccess.ok(ResumeResponseType.fromResume(item));
  }
}

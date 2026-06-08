import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from '@/modules/categories/categories.service';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import { CategoryResponseType } from '@/modules/categories/type/categories-response.type';
import { ResponsePaginatedSuccess } from '@/common/types/response.type';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiResponsePaginatedSuccess } from '@/common/decorators/api-response-paginated-success.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('all')
  @ApiOperation({
    summary: '모든 카테고리 조회',
    description:
      '활성화된(isActive=true) 직무 카테고리를 소속 그룹(group) 정보와 함께 페이지네이션하여 조회합니다. ' +
      '페이지·정렬은 쿼리 파라미터(page, limit, sort, order)로 제어하며, 미전달 시 기본값(page=1, limit=10, sort=createdAt, order=desc)이 적용됩니다. ' +
      '카테고리는 일반 유저가 생성·수정·삭제할 수 없으며 조회만 가능합니다. 관리(생성·수정·삭제)는 추후 AdminJS 기반 관리자 도구를 통해 제공될 예정입니다.',
  })
  @ApiResponsePaginatedSuccess(CategoryResponseType)
  async getAllCategories(
    @Query() paginationDto: PaginationDto,
  ): Promise<ResponsePaginatedSuccess<CategoryResponseType>> {
    const { items, total } =
      await this.categoriesService.findAllItems(paginationDto);
    return new ResponsePaginatedSuccess<CategoryResponseType>(
      items.map(CategoryResponseType.fromCategory),
      {
        ...paginationDto,
        total,
      },
    );
  }
}

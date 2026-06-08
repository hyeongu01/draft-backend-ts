import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from '@/modules/categories/categories.service';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponseSuccess } from '@/common/decorators/api-response-success.decorator';
import { CategoryResponseType } from '@/modules/categories/type/categories-response.type';
import { ResponsePaginatedSuccess } from '@/common/types/response.type';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('all')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponseSuccess(ResponsePaginatedSuccess<CategoryResponseType>)
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

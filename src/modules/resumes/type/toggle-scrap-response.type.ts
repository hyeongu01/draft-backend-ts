import { ApiProperty } from '@nestjs/swagger';

export class ToggleScrapResponseType {
  @ApiProperty()
  scrapCount: number;

  @ApiProperty()
  isScrapped: boolean;
}

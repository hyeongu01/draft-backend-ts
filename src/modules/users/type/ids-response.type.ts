import { ApiProperty } from '@nestjs/swagger';

export class IdsResponseType {
  @ApiProperty({ description: 'id 들의 배열' })
  ids: string[];
}

import { ApiProperty } from '@nestjs/swagger';

export class ToggleLikeResponseType {
  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  isLiked: boolean;
}

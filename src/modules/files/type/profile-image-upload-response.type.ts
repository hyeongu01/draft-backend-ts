import { ApiProperty } from '@nestjs/swagger';

export class ProfileImageUploadResponseType {
  @ApiProperty()
  profileImageUrl: string;
}

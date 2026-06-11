import { UsersService } from '@/modules/users/users.service';
import { Controller } from '@nestjs/common';

@Controller('public/users')
export class PublicUsersController {
  constructor(private readonly usersService: UsersService) {}
}

import { Controller, Inject, Post, Body } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/user')
export class LoginController {
  @Inject()
  userService: UserService;
  @Post('/login')
  async login(@Body() body) {
    const user = await this.userService.getUser({
      username: body.username,
      password: body.password,
    });
    return user;
  }
}

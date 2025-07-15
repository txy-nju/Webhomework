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

  @Post('/register')
  async register(@Body() body) {
    // 检查必要字段
    if (!body.username || !body.password || !body.email) {
      return { success: false, message: '用户名、密码和邮箱不能为空' };
    }

    try {
      // 检查用户是否已存在
      const existingUser = await this.userService.getUserByUsername(
        body.username
      );
      if (existingUser) {
        return { success: false, message: '用户名已存在' };
      }

      // 创建新用户
      const newUser = await this.userService.createUser({
        username: body.username,
        password: body.password,
        email: body.email,
      });
      return { success: true, message: '注册成功', user: newUser };
    } catch (error) {
      return { success: false, message: '注册失败，请重试' };
    }
  }
}

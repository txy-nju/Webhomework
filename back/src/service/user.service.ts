import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  async getUser(LoginData: { username: string; password: string }) {
    const user = await this.userModel.findOne({
      where: { username: LoginData.username },
    });
    if (user) {
      if (user.password === LoginData.password) {
        return {
          success: true,
          message: '登录成功',
          data: { username: user.username, id: user.id },
        };
      } else {
        return { success: false, message: '密码错误' };
      }
    } else {
      return { success: false, message: '用户不存在' };
    }
  }
}

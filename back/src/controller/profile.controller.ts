import { Controller, Get, Query, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/user')
export class ProfileController {
  @Inject()
  userService: UserService;

  /**
   * 获取用户参与的活动
   */
  @Get('/participated-activities')
  async getParticipatedActivities(@Query('userId') userId: string) {
    if (!userId) {
      return {
        success: false,
        message: '用户ID不能为空',
      };
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return {
        success: false,
        message: '用户ID格式不正确',
      };
    }

    return await this.userService.getParticipatedActivities(userIdNum);
  }

  /**
   * 获取用户创建的活动
   */
  @Get('/created-activities')
  async getCreatedActivities(@Query('userId') userId: string) {
    if (!userId) {
      return {
        success: false,
        message: '用户ID不能为空',
      };
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return {
        success: false,
        message: '用户ID格式不正确',
      };
    }

    return await this.userService.getCreatedActivities(userIdNum);
  }
}

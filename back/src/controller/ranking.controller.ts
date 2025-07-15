import { Controller, Inject, Get } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/ranking')
export class RankingController {
  @Inject()
  userService: UserService;

  @Get('/users')
  async getUserRanking() {
    try {
      const ranking = await this.userService.getUserRanking();
      return {
        success: true,
        data: ranking,
      };
    } catch (error) {
      return {
        success: false,
        message: '获取排行榜失败: ' + error.message,
      };
    }
  }
}

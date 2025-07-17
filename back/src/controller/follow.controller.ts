import { Controller, Inject, Post, Get, Body, Query } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/follow')
export class FollowController {
  @Inject()
  userService: UserService;

  // 关注用户
  @Post('/follow')
  async followUser(@Body() body) {
    try {
      const { followerId, followingId } = body;

      if (!followerId || !followingId) {
        return {
          success: false,
          message: '参数不完整',
        };
      }

      const result = await this.userService.followUser(followerId, followingId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || '关注失败',
      };
    }
  }

  // 取消关注用户
  @Post('/unfollow')
  async unfollowUser(@Body() body) {
    try {
      const { followerId, followingId } = body;

      if (!followerId || !followingId) {
        return {
          success: false,
          message: '参数不完整',
        };
      }

      const result = await this.userService.unfollowUser(
        followerId,
        followingId
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || '取消关注失败',
      };
    }
  }

  // 获取关注列表
  @Get('/following')
  async getFollowing(@Query('userId') userId: number) {
    try {
      if (!userId) {
        return {
          success: false,
          message: '用户ID不能为空',
        };
      }

      const result = await this.userService.getUserFollowing(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取关注列表失败',
      };
    }
  }

  // 获取粉丝列表
  @Get('/followers')
  async getFollowers(@Query('userId') userId: number) {
    try {
      if (!userId) {
        return {
          success: false,
          message: '用户ID不能为空',
        };
      }

      const result = await this.userService.getUserFollowers(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取粉丝列表失败',
      };
    }
  }

  // 检查关注状态
  @Get('/status')
  async checkFollowStatus(
    @Query('followerId') followerId: number,
    @Query('followingId') followingId: number
  ) {
    try {
      if (!followerId || !followingId) {
        return {
          success: false,
          message: '参数不完整',
        };
      }

      const result = await this.userService.checkFollowStatus(
        followerId,
        followingId
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || '检查关注状态失败',
      };
    }
  }
}

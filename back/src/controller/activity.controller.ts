import { Controller, Post, Body, Inject, Get, Query } from '@midwayjs/core';
import { ActivityService } from '../service/activity.service';

@Controller('/api/activity')
export class ActivityController {
  @Inject()
  activityService: ActivityService;

  // 获取所有活动列表
  @Get('/all')
  async getAllActivities() {
    try {
      const activities = await this.activityService.getAllActivities();
      return { success: true, data: activities };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('/create')
  async create(@Body() body) {
    try {
      if (!body.userId) {
        return { success: false, message: '创建活动需要指定用户ID' };
      }

      const result = await this.activityService.createActivity(body);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 参与活动
  @Post('/join')
  async joinActivity(@Body() body: { activityId: number; userId: number }) {
    try {
      const result = await this.activityService.joinActivity(
        body.activityId,
        body.userId
      );
      return { success: true, message: '成功参与活动', data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 退出活动
  @Post('/leave')
  async leaveActivity(@Body() body: { activityId: number; userId: number }) {
    try {
      const result = await this.activityService.leaveActivity(
        body.activityId,
        body.userId
      );
      return { success: true, message: '成功退出活动', data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 获取活动参与者
  @Get('/participants')
  async getParticipants(@Query('activityId') activityId: number) {
    try {
      const participants = await this.activityService.getActivityParticipants(
        activityId
      );
      return { success: true, data: participants };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 添加评论
  @Post('/comment')
  async addComment(
    @Body() body: { activityId: number; userId: number; content: string }
  ) {
    try {
      const result = await this.activityService.addComment(
        body.activityId,
        body.userId,
        body.content
      );
      return { success: true, message: '评论添加成功', data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 获取活动评论
  @Get('/comments')
  async getComments(@Query('activityId') activityId: number) {
    try {
      const comments = await this.activityService.getActivityComments(
        activityId
      );
      return { success: true, data: comments };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 删除评论
  @Post('/comment/delete')
  async deleteComment(@Body() body: { commentId: number; userId: number }) {
    try {
      const result = await this.activityService.deleteComment(
        body.commentId,
        body.userId
      );
      return { success: true, message: '评论删除成功', data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 根据ID获取活动详情
  @Get('/detail')
  async getActivityDetail(@Query('activityId') activityId: number) {
    try {
      const activity = await this.activityService.getActivityById(activityId);
      return { success: true, data: activity };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 更新活动信息
  @Post('/update')
  async updateActivity(
    @Body() body: { activityId: number; userId: number; updateData: any }
  ) {
    try {
      const result = await this.activityService.updateActivity(
        body.activityId,
        body.userId,
        body.updateData
      );
      return { success: true, message: '活动更新成功', data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 更新活动状态
  @Post('/update-status')
  async updateActivityStatus(
    @Body() body: { activityId: number; userId: number; status: string }
  ) {
    try {
      const result = await this.activityService.updateActivityStatus(
        body.activityId,
        body.userId,
        body.status
      );
      return { success: true, message: '活动状态更新成功', data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

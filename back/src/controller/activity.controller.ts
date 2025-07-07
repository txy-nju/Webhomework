import { Controller, Post, Body, Inject } from '@midwayjs/core';
import { ActivityService } from '../service/activity.service';

@Controller('/api/activity')
export class ActivityController {
  @Inject()
  activityService: ActivityService;

  @Post('/create')
  async create(@Body() body) {
    const result = await this.activityService.createActivity(body);
    return { success: true, data: result };
  }
}

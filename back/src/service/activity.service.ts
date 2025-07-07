import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../entity/activity.entity';

@Provide()
export class ActivityService {
  @InjectEntityModel(Activity)
  activityModel: Repository<Activity>;

  // 根据前端传入的数据创建活动
  async createActivity(data: Partial<Activity>) {
    const activity = this.activityModel.create(data);
    return await this.activityModel.save(activity);
  }
}

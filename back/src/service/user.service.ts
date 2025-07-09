import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Comment } from '../entity/comment.entity';
import { Activity } from '../entity/activity.entity';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  @InjectEntityModel(Comment)
  commentModel: Repository<Comment>;

  @InjectEntityModel(Activity)
  activityModel: Repository<Activity>;

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

  // 获取用户的所有评论
  async getUserComments(userId: number) {
    return await this.commentModel.find({
      where: { author: { id: userId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  // 获取用户参与的活动
  async getParticipatedActivities(userId: number) {
    try {
      const user = await this.userModel.findOne({
        where: { id: userId },
        relations: [
          'participatedActivities',
          'participatedActivities.participants',
        ],
      });

      if (!user) {
        return { success: false, message: '用户不存在' };
      }

      // 为每个活动添加参与人数
      const activitiesWithCount = user.participatedActivities.map(activity => ({
        ...activity,
        participantCount: activity.participants
          ? activity.participants.length
          : 0,
      }));

      return {
        success: true,
        data: activitiesWithCount,
      };
    } catch (error) {
      console.error('获取参与活动失败:', error);
      return { success: false, message: '获取参与活动失败: ' + error.message };
    }
  }

  // 获取用户创建的活动
  async getCreatedActivities(userId: number) {
    try {
      const user = await this.userModel.findOne({
        where: { id: userId },
        relations: ['createdActivities', 'createdActivities.participants'],
      });

      if (!user) {
        return { success: false, message: '用户不存在' };
      }

      // 为每个活动添加参与人数
      const activitiesWithCount = user.createdActivities.map(activity => ({
        ...activity,
        participantCount: activity.participants
          ? activity.participants.length
          : 0,
      }));

      return {
        success: true,
        data: activitiesWithCount,
      };
    } catch (error) {
      console.error('获取创建活动失败:', error);
      return { success: false, message: '获取创建活动失败: ' + error.message };
    }
  }
}

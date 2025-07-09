import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../entity/activity.entity';
import { User } from '../entity/user.entity';
import { Comment } from '../entity/comment.entity';

@Provide()
export class ActivityService {
  @InjectEntityModel(Activity)
  activityModel: Repository<Activity>;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  @InjectEntityModel(Comment)
  commentModel: Repository<Comment>;

  // 根据前端传入的数据创建活动
  async createActivity(data: Partial<Activity> & { userId: number }) {
    const { userId, ...activityData } = data;

    // 查找创建者用户
    const user = await this.userModel.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('创建者用户不存在');
    }

    // 创建活动并设置创建者
    const activity = this.activityModel.create({
      ...activityData,
      user: user, // 设置创建者
    });

    return await this.activityModel.save(activity);
  }

  // 用户参与活动
  async joinActivity(activityId: number, userId: number) {
    const activity = await this.activityModel.findOne({
      where: { id: activityId },
      relations: ['participants'],
    });

    const user = await this.userModel.findOne({
      where: { id: userId },
    });

    if (!activity || !user) {
      throw new Error('Activity or User not found');
    }

    // 检查用户是否已经参与
    const isAlreadyParticipant = activity.participants.some(
      p => p.id === userId
    );
    if (isAlreadyParticipant) {
      throw new Error('User already participating in this activity');
    }

    // 添加参与者
    activity.participants.push(user);
    return await this.activityModel.save(activity);
  }

  // 用户退出活动
  async leaveActivity(activityId: number, userId: number) {
    const activity = await this.activityModel.findOne({
      where: { id: activityId },
      relations: ['participants'],
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    // 从参与者列表中移除用户
    activity.participants = activity.participants.filter(p => p.id !== userId);
    return await this.activityModel.save(activity);
  }

  // 获取活动的所有参与者
  async getActivityParticipants(activityId: number) {
    const activity = await this.activityModel.findOne({
      where: { id: activityId },
      relations: ['participants'],
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    return activity.participants;
  }

  // 为活动添加评论
  async addComment(activityId: number, userId: number, content: string) {
    const activity = await this.activityModel.findOne({
      where: { id: activityId },
    });

    const user = await this.userModel.findOne({
      where: { id: userId },
    });

    if (!activity || !user) {
      throw new Error('Activity or User not found');
    }

    const comment = this.commentModel.create({
      content,
      author: user,
      activityId: activityId, // 直接存储活动ID
    });

    return await this.commentModel.save(comment);
  }

  // 获取活动的所有评论
  async getActivityComments(activityId: number) {
    return await this.commentModel.find({
      where: { activityId: activityId }, // 使用activityId字段查询
      relations: ['author'],
      order: { createdAt: 'DESC' }, // 按时间倒序排列
    });
  }

  // 删除评论（只有评论作者可以删除）
  async deleteComment(commentId: number, userId: number) {
    const comment = await this.commentModel.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.author.id !== userId) {
      throw new Error('Only comment author can delete this comment');
    }

    return await this.commentModel.remove(comment);
  }

  // 获取所有活动列表
  async getAllActivities() {
    try {
      const activities = await this.activityModel.find({
        relations: ['user', 'participants'],
        order: { createdAt: 'DESC' },
      });

      // 为每个活动添加参与人数
      const activitiesWithCount = activities.map(activity => ({
        ...activity,
        participantCount: activity.participants
          ? activity.participants.length
          : 0,
      }));

      return activitiesWithCount;
    } catch (error) {
      console.error('获取所有活动失败:', error);
      throw new Error('获取活动列表失败');
    }
  }

  // 根据ID获取活动详情
  async getActivityById(activityId: number) {
    const activity = await this.activityModel.findOne({
      where: { id: activityId },
      relations: ['user', 'participants'],
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    return activity;
  }

  // 更新活动信息（只有创建者可以更新）
  async updateActivity(
    activityId: number,
    userId: number,
    updateData: Partial<Activity>
  ) {
    const activity = await this.activityModel.findOne({
      where: { id: activityId },
      relations: ['user'],
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.user.id !== userId) {
      throw new Error('Only activity creator can update this activity');
    }

    // 更新活动信息
    Object.assign(activity, updateData);
    return await this.activityModel.save(activity);
  }
}

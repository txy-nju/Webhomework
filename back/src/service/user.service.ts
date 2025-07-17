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

  // 根据用户名获取用户
  async getUserByUsername(username: string) {
    return await this.userModel.findOne({
      where: { username },
    });
  }

  // 创建新用户
  async createUser(userData: {
    username: string;
    password: string;
    email: string;
  }) {
    try {
      const newUser = this.userModel.create({
        username: userData.username,
        password: userData.password,
        email: userData.email,
      });

      return await this.userModel.save(newUser);
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  // 更新用户积分
  async updateUserScore(userId: number, scoreChange: number) {
    try {
      const user = await this.userModel.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('用户不存在');
      }

      user.score += scoreChange;
      return await this.userModel.save(user);
    } catch (error) {
      console.error('更新用户积分失败:', error);
      throw error;
    }
  }

  // 获取用户排行榜
  async getUserRanking() {
    try {
      const users = await this.userModel.find({
        order: { score: 'DESC' },
        select: ['id', 'username', 'score'],
      });

      return users.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
    } catch (error) {
      console.error('获取用户排行榜失败:', error);
      throw error;
    }
  }

  // 关注用户
  async followUser(followerId: number, followingId: number) {
    try {
      if (followerId === followingId) {
        throw new Error('不能关注自己');
      }

      const follower = await this.userModel.findOne({
        where: { id: followerId },
        relations: ['following'],
      });

      const following = await this.userModel.findOne({
        where: { id: followingId },
      });

      if (!follower || !following) {
        throw new Error('用户不存在');
      }

      // 检查是否已经关注
      const isAlreadyFollowing = follower.following.some(
        user => user.id === followingId
      );

      if (isAlreadyFollowing) {
        throw new Error('已经关注了该用户');
      }

      // 添加关注关系
      follower.following.push(following);
      await this.userModel.save(follower);

      return { success: true, message: '关注成功' };
    } catch (error) {
      console.error('关注用户失败:', error);
      throw error;
    }
  }

  // 取消关注用户
  async unfollowUser(followerId: number, followingId: number) {
    try {
      const follower = await this.userModel.findOne({
        where: { id: followerId },
        relations: ['following'],
      });

      if (!follower) {
        throw new Error('用户不存在');
      }

      // 移除关注关系
      follower.following = follower.following.filter(
        user => user.id !== followingId
      );
      await this.userModel.save(follower);

      return { success: true, message: '取消关注成功' };
    } catch (error) {
      console.error('取消关注失败:', error);
      throw error;
    }
  }

  // 获取用户的关注列表
  async getUserFollowing(userId: number) {
    try {
      const user = await this.userModel.findOne({
        where: { id: userId },
        relations: ['following'],
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      return {
        success: true,
        data: user.following.map(followedUser => ({
          id: followedUser.id,
          username: followedUser.username,
          score: followedUser.score,
        })),
      };
    } catch (error) {
      console.error('获取关注列表失败:', error);
      throw error;
    }
  }

  // 获取用户的粉丝列表
  async getUserFollowers(userId: number) {
    try {
      const user = await this.userModel.findOne({
        where: { id: userId },
        relations: ['followers'],
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      return {
        success: true,
        data: user.followers.map(follower => ({
          id: follower.id,
          username: follower.username,
          score: follower.score,
        })),
      };
    } catch (error) {
      console.error('获取粉丝列表失败:', error);
      throw error;
    }
  }

  // 检查是否已关注某用户
  async checkFollowStatus(followerId: number, followingId: number) {
    try {
      const follower = await this.userModel.findOne({
        where: { id: followerId },
        relations: ['following'],
      });

      if (!follower) {
        return { success: false, isFollowing: false };
      }

      const isFollowing = follower.following.some(
        user => user.id === followingId
      );

      return { success: true, isFollowing };
    } catch (error) {
      console.error('检查关注状态失败:', error);
      throw error;
    }
  }
}

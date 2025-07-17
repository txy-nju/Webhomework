import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Activity } from './activity.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'int', default: 0 })
  score: number; // 用户积分

  @OneToMany(() => Activity, activity => activity.user)
  createdActivities: Activity[]; // 用户发起的活动列表

  @ManyToMany(() => Activity, activity => activity.participants)
  participatedActivities: Activity[]; // 用户参与的活动列表

  // 我关注的人
  @ManyToMany(() => User, user => user.followers)
  @JoinTable({
    name: 'user_follows',
    joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'following_id', referencedColumnName: 'id' },
  })
  following: User[]; // 我关注的人列表（关注列表）

  // 关注我的人
  @ManyToMany(() => User, user => user.following)
  followers: User[]; // 关注我的人列表（粉丝列表）
}

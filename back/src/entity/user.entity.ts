import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
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

  @OneToMany(() => Activity, activity => activity.user)
  createdActivities: Activity[]; // 用户发起的活动列表

  @ManyToMany(() => Activity, activity => activity.participants)
  participatedActivities: Activity[]; // 用户参与的活动列表
}

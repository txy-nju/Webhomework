import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User; // 发起活动的用户

  @Column({ type: 'varchar', nullable: true })
  photo: string; // 活动照片（图片URL或路径）

  @Column({ type: 'varchar' })
  name: string; // 活动名称

  @Column({ type: 'varchar' })
  time: string; // 活动时间（可用 Date 类型，根据实际需求调整）

  @Column({ type: 'text' })
  description: string; // 活动描述

  @ManyToMany(() => User)
  @JoinTable() // 这会创建一个中间表来存储多对多关系
  participants: User[]; // 活动的参与者列表
}

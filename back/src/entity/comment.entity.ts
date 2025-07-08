import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string; // 评论内容

  @CreateDateColumn()
  createdAt: Date; // 评论创建时间

  @Column({ type: 'int' })
  activityId: number; // 所属活动的ID

  @ManyToOne(() => User)
  author: User; // 评论作者
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User; // 发起活动的用户

  @Column({ nullable: true })
  photo: string; // 活动照片（图片URL或路径）

  @Column()
  name: string; // 活动名称

  @Column()
  time: string; // 活动时间（可用 Date 类型，根据实际需求调整）

  @Column('text')
  description: string; // 活动描述
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum EventType {
  FALL = 'FALL',   // Rơi tự do
  SLAP = 'SLAP',   // Bị tát/va đập
}

@Entity('drop_events')
export class DropEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.dropEvents, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'float' })
  impactForce: number; // Cường độ va chạm (m/s² hoặc G-force)

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.FALL,
  })
  eventType: EventType;

  @Column({ length: 100, nullable: true })
  deviceModel: string; // Model điện thoại (nếu muốn hiển thị)

  @CreateDateColumn()
  timestamp: Date;
}

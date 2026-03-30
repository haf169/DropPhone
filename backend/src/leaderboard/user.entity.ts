import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DropEvent } from './drop-event.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  deviceId: string; // Định danh thiết bị (UUID từ Capacitor Device plugin)

  @Column({ length: 50, default: 'Anonymous' })
  username: string;

  @OneToMany(() => DropEvent, (event) => event.user)
  dropEvents: DropEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

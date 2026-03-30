import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum SoundType {
  FALL = 'FALL',
  SLAP = 'SLAP',
}

@Entity('sounds')
export class Sound {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 500 })
  filename: string; // Tên file lưu trong uploads/

  @Column({
    type: 'enum',
    enum: SoundType,
    default: SoundType.FALL,
  })
  type: SoundType;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

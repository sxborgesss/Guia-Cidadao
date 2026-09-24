import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PublicService } from '../../services/entities/service.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  nota: number;

  @Column({ type: 'text' })
  comentario: string;

  @ManyToOne(() => PublicService, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: PublicService;

  @Column()
  service_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @CreateDateColumn()
  created_at: Date;
}
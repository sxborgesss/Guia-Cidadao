
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';

@Entity('review_responses')
export class ReviewResponse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    resposta: string;

    // Cada avaliação pode ter apenas uma resposta oficial.
    @OneToOne(() => Review, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'review_id' })
    review: Review;

    // Um gestor pode responder várias avaliações.
    @ManyToOne(() => User, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'gestor_id' })
    gestor: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

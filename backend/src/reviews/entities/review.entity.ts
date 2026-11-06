
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from 'typeorm';

import { PublicService } from '../../services/entities/service.entity';
import { User } from '../../users/entities/user.entity';
import { ReviewResponse } from './review-response.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    nota: number;

    @Column({ type: 'text' })
    comentario: string;

    @Column({ default: false })
    isAnonimo: boolean;

    @ManyToOne(() => PublicService, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'service_id' })
    service: PublicService;

    @Column()
    service_id: string;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: string;

    @OneToOne(
        () => ReviewResponse,
        (resposta) => resposta.review,
    )
    respostaInstitucional: ReviewResponse;

    @CreateDateColumn()
    created_at: Date;
}


import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';

export enum ReviewReportStatus {
    PENDENTE = 'PENDENTE',
    ANALISADA = 'ANALISADA',
    DESCARTADA = 'DESCARTADA',
}

@Entity('review_reports')
export class ReviewReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Avaliação que está sendo denunciada.
    @ManyToOne(() => Review, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'review_id' })
    review: Review;

    // Cidadão que realizou a denúncia.
    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'reporter_id' })
    reporter: User;

    @Column({ type: 'varchar', length: 100 })
    motivo: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    descricao: string | null;

    @Column({
        type: 'varchar',
        length: 20,
        default: ReviewReportStatus.PENDENTE,
    })
    status: ReviewReportStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    serviceId: string;

    @Column('int')
    notaGeral: number;

    @Column('int')
    notaAtendimento: number;

    @Column('int')
    notaEspera: number;

    @Column('int')
    notaInfraestrutura: number;

    @Column({ type: 'text', nullable: true })
    relato: string;

    @Column({ default: false })
    isAnonimo: boolean;

    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    created_at: Date;
}
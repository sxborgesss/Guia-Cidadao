import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
} from 'typeorm';

import { PublicService } from '../../services/entities/service.entity';

export enum UserRole {
    CIDADAO = 'CIDADAO',
    GESTOR = 'GESTOR',
    ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nome: string;

    @Column({ unique: true })
    email: string;

    @Column()
    senha: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CIDADAO,
    })
    role: UserRole;

    @ManyToMany(
        () => PublicService,
        (servico) => servico.gestores,
    )
    servicosGerenciados: PublicService[];

    @Column({
        name: 'password_reset_token_hash',
        type: 'varchar',
        nullable: true,
        select: false,
    })
    passwordResetTokenHash: string | null;

    @Column({
        name: 'password_reset_expires_at',
        type: 'timestamptz',
        nullable: true,
        select: false,
    })
    passwordResetExpiresAt: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
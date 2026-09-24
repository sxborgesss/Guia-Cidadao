import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
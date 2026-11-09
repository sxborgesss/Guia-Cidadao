
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum ManifestacaoTipo {
    RECLAMACAO = 'RECLAMACAO',
    DENUNCIA = 'DENUNCIA',
    SUGESTAO = 'SUGESTAO',
    ELOGIO = 'ELOGIO',
    SOLICITACAO = 'SOLICITACAO',
}

export enum ManifestacaoStatus {
    RECEBIDA = 'RECEBIDA',
    EM_ANALISE = 'EM_ANALISE',
    RESPONDIDA = 'RESPONDIDA',
    ENCERRADA = 'ENCERRADA',
}

@Entity('manifestacoes')
export class Manifestacao {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Protocolo único para acompanhamento da manifestação.
    @Column({
        type: 'varchar',
        length: 40,
        unique: true,
    })
    protocolo: string;

    // Tipo da manifestação.
    @Column({
        type: 'varchar',
        length: 30,
    })
    tipo: ManifestacaoTipo;

    // Assunto informado pelo cidadão.
    @Column({
        type: 'varchar',
        length: 150,
    })
    assunto: string;

    // Descrição detalhada da manifestação.
    @Column({
        type: 'text',
    })
    descricao: string;

    // Situação atual da manifestação.
    @Column({
        type: 'varchar',
        length: 20,
        default: ManifestacaoStatus.RECEBIDA,
    })
    status: ManifestacaoStatus;

    // Resposta oficial da administração.
    @Column({
        type: 'text',
        nullable: true,
    })
    resposta: string | null;

    // Cidadão que registrou a manifestação.
    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'user_id' })
    usuario: User | null;

    @Column({
        type: 'uuid',
        nullable: true,
    })
    user_id: string | null;

    // Administrador responsável pela resposta.
    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'respondido_por_id' })
    respondidoPor: User | null;

    @Column({
        type: 'uuid',
        nullable: true,
    })
    respondido_por_id: string | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

import {
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

import {
    Manifestacao,
    ManifestacaoTipo,
    ManifestacaoStatus,
} from './entities/manifestacao.entity';

import { User } from '../users/entities/user.entity';

export class CriarManifestacaoDto {
    @IsEnum(ManifestacaoTipo, {
        message: 'Selecione um tipo válido de manifestação.',
    })
    tipo!: ManifestacaoTipo;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    assunto!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    descricao!: string;
}

@Injectable()
export class OuvidoriaService {
    constructor(
        @InjectRepository(Manifestacao)
        private readonly manifestacaoRepository: Repository<Manifestacao>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    private normalizarValor(valor: unknown): string {
        return String(valor ?? '')
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase()
            .replace(/[\s-]+/g, '_');
    }

    async criarManifestacao(
        dto: CriarManifestacaoDto,
        userId: string,
    ) {
        const tipoNormalizado = this.normalizarValor(dto?.tipo);

        if (
            !Object.values(ManifestacaoTipo).includes(
                tipoNormalizado as ManifestacaoTipo,
            )
        ) {
            throw new BadRequestException(
                'Selecione um tipo válido de manifestação.',
            );
        }

        if (!dto.assunto || !dto.assunto.trim()) {
            throw new BadRequestException(
                'Informe o assunto da manifestação.',
            );
        }

        if (dto.assunto.trim().length > 150) {
            throw new BadRequestException(
                'O assunto deve ter no máximo 150 caracteres.',
            );
        }

        if (!dto.descricao || !dto.descricao.trim()) {
            throw new BadRequestException(
                'Informe a descrição da manifestação.',
            );
        }

        if (dto.descricao.trim().length > 5000) {
            throw new BadRequestException(
                'A descrição deve ter no máximo 5000 caracteres.',
            );
        }

        const usuario = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!usuario) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        const protocolo = `OUV-${new Date().getFullYear()}-${randomBytes(4)
            .toString('hex')
            .toUpperCase()}`;

        const novaManifestacao = this.manifestacaoRepository.create({
            protocolo,
            tipo: tipoNormalizado as ManifestacaoTipo,
            assunto: dto.assunto.trim(),
            descricao: dto.descricao.trim(),
            status: ManifestacaoStatus.RECEBIDA,
            usuario,
            user_id: usuario.id,
        });

        const salva = await this.manifestacaoRepository.save(
            novaManifestacao,
        );

        return {
            id: salva.id,
            protocolo: salva.protocolo,
            tipo: salva.tipo,
            assunto: salva.assunto,
            descricao: salva.descricao,
            status: salva.status,
            created_at: salva.created_at,
        };
    }

    async listarMinhasManifestacoes(userId: string) {
        return this.manifestacaoRepository
            .createQueryBuilder('manifestacao')
            .where('manifestacao.user_id = :userId', { userId })
            .orderBy('manifestacao.created_at', 'DESC')
            .getMany();
    }

    async buscarPorProtocolo(
        protocolo: string,
        userId: string,
    ) {
        const manifestacao = await this.manifestacaoRepository.findOne({
            where: {
                protocolo: protocolo.trim(),
                user_id: userId,
            },
        });

        if (!manifestacao) {
            throw new NotFoundException(
                'Manifestação não encontrada.',
            );
        }

        return manifestacao;
    }

    async listarTodasParaAdmin() {
        return this.manifestacaoRepository
            .createQueryBuilder('manifestacao')
            .leftJoin('manifestacao.usuario', 'usuario')
            .addSelect([
                'usuario.id',
                'usuario.nome',
                'usuario.email',
            ])
            .leftJoin(
                'manifestacao.respondidoPor',
                'respondidoPor',
            )
            .addSelect([
                'respondidoPor.id',
                'respondidoPor.nome',
            ])
            .orderBy('manifestacao.created_at', 'DESC')
            .getMany();
    }

    async atualizarManifestacao(
        manifestacaoId: string,
        status: ManifestacaoStatus,
        resposta: string | undefined,
        administradorId: string,
    ) {
        const statusNormalizado = this.normalizarValor(status);

        if (
            !Object.values(ManifestacaoStatus).includes(
                statusNormalizado as ManifestacaoStatus,
            )
        ) {
            throw new BadRequestException(
                'Selecione um status válido.',
            );
        }

        const manifestacao = await this.manifestacaoRepository.findOne({
            where: { id: manifestacaoId },
        });

        if (!manifestacao) {
            throw new NotFoundException(
                'Manifestação não encontrada.',
            );
        }

        if (resposta !== undefined) {
            if (!resposta.trim()) {
                throw new BadRequestException(
                    'A resposta não pode ficar vazia.',
                );
            }

            const administrador = await this.userRepository.findOne({
                where: { id: administradorId },
            });

            if (!administrador) {
                throw new NotFoundException(
                    'Administrador não encontrado.',
                );
            }

            manifestacao.resposta = resposta.trim();
            manifestacao.respondidoPor = administrador;
            manifestacao.respondido_por_id = administrador.id;
        }

        const novoStatus =
            statusNormalizado as ManifestacaoStatus;

        if (
            novoStatus === ManifestacaoStatus.RESPONDIDA &&
            !manifestacao.resposta
        ) {
            throw new BadRequestException(
                'Registre uma resposta antes de marcar a manifestação como respondida.',
            );
        }

        manifestacao.status = novoStatus;

        const atualizada = await this.manifestacaoRepository.save(
            manifestacao,
        );

        return {
            id: atualizada.id,
            protocolo: atualizada.protocolo,
            status: atualizada.status,
            resposta: atualizada.resposta,
            updated_at: atualizada.updated_at,
        };
    }
}
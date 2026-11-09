import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';

import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { OuvidoriaService } from './ouvidoria.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import {
    ManifestacaoTipo,
    ManifestacaoStatus,
} from './entities/manifestacao.entity';

import { CriarManifestacaoDto } from './ouvidoria.service';

interface AuthenticatedRequest {
    user: {
        id: string;
        role: string;
    };
}

export class AtualizarManifestacaoDto {
    @IsEnum(ManifestacaoStatus, {
        message: 'Selecione um status válido.',
    })
    status!: ManifestacaoStatus;

    @IsOptional()
    @IsString()
    @MaxLength(5000)
    resposta?: string;
}

@Controller('ouvidoria')
export class OuvidoriaController {
    constructor(
        private readonly ouvidoriaService: OuvidoriaService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async criarManifestacao(
        @Body() body: CriarManifestacaoDto,
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'CIDADAO') {
            throw new ForbiddenException(
                'Apenas cidadãos podem registrar manifestações.',
            );
        }

        return this.ouvidoriaService.criarManifestacao(
            {
                tipo: body.tipo,
                assunto: body.assunto,
                descricao: body.descricao,
            },
            request.user.id,
        );
    }

    @Get('minhas')
    @UseGuards(JwtAuthGuard)
    async listarMinhasManifestacoes(
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'CIDADAO') {
            throw new ForbiddenException(
                'Apenas cidadãos podem consultar esta área.',
            );
        }

        return this.ouvidoriaService.listarMinhasManifestacoes(
            request.user.id,
        );
    }

    @Get('protocolo/:protocolo')
    @UseGuards(JwtAuthGuard)
    async buscarPorProtocolo(
        @Param('protocolo') protocolo: string,
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'CIDADAO') {
            throw new ForbiddenException(
                'Apenas cidadãos podem consultar protocolos nesta rota.',
            );
        }

        return this.ouvidoriaService.buscarPorProtocolo(
            protocolo,
            request.user.id,
        );
    }

    @Get('admin/todas')
    @UseGuards(JwtAuthGuard)
    async listarTodasParaAdmin(
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'ADMIN') {
            throw new ForbiddenException(
                'Apenas administradores podem acessar esta área.',
            );
        }

        return this.ouvidoriaService.listarTodasParaAdmin();
    }

    @Patch('admin/:id')
    @UseGuards(JwtAuthGuard)
    async atualizarManifestacao(
        @Param('id') id: string,
        @Body() body: AtualizarManifestacaoDto,
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'ADMIN') {
            throw new ForbiddenException(
                'Apenas administradores podem atualizar manifestações.',
            );
        }

        return this.ouvidoriaService.atualizarManifestacao(
            id,
            body.status,
            body.resposta,
            request.user.id,
        );
    }
}
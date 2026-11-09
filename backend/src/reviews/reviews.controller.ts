
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Patch,
    Delete,
    Req,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: {
        id: string;
        role: string;
    };
}

@Controller('reviews')
export class ReviewsController {
    constructor(
        private readonly reviewsService: ReviewsService,
    ) {}

    // Criar avaliação usando a identidade do JWT.
    @Post()
    @UseGuards(JwtAuthGuard)
    async criar(
        @Body() body: any,
        @Req() request: AuthenticatedRequest,
    ) {
        const serviceId = body.service_id || body.serviceId;
        const nota = Number(body.nota);
        const comentario = body.comentario;
        const isAnonimo = body.isAnonimo === true;

        const userId = request.user.id;

        return this.reviewsService.create(
            {
                nota,
                comentario,
                service_id: serviceId,
                isAnonimo,
            },
            userId,
        );
    }

    // Consultar avaliações públicas de um serviço.
    @Get('service/:serviceId')
    async listarPorServico(
        @Param('serviceId') serviceId: string,
    ) {
        return this.reviewsService.findByService(serviceId);
    }

    // Consultar avaliações dos serviços do gestor autenticado.
    @Get('gestor/minhas')
    @UseGuards(JwtAuthGuard)
    async listarAvaliacoesDoGestor(
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'GESTOR') {
            throw new ForbiddenException(
                'Apenas gestores podem acessar esta área.',
            );
        }

        return this.reviewsService.findByGestor(
            request.user.id,
        );
    }

    // Responder oficialmente a uma avaliação.
    @Post(':reviewId/responder')
    @UseGuards(JwtAuthGuard)
    async responderAvaliacao(
        @Param('reviewId') reviewId: string,
        @Body('resposta') resposta: string,
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'GESTOR') {
            throw new ForbiddenException(
                'Apenas gestores podem responder avaliações.',
            );
        }

        return this.reviewsService.responderAvaliacao(
            reviewId,
            request.user.id,
            resposta,
        );
    }

    // Cidadão denuncia uma avaliação.
    @Post(':reviewId/denunciar')
    @UseGuards(JwtAuthGuard)
    async denunciarAvaliacao(
        @Param('reviewId') reviewId: string,
        @Body('motivo') motivo: string,
        @Body('descricao') descricao: string,
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'CIDADAO') {
            throw new ForbiddenException(
                'Apenas cidadãos podem denunciar avaliações.',
            );
        }

        return this.reviewsService.denunciarAvaliacao(
            reviewId,
            request.user.id,
            motivo,
            descricao,
        );
    }

    // Listar todas as avaliações para moderação administrativa.
    @Get('admin/todas')
    @UseGuards(JwtAuthGuard)
    async listarTodasParaAdmin(
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'ADMIN') {
            throw new ForbiddenException(
                'Apenas administradores podem consultar todas as avaliações.',
            );
        }

        return this.reviewsService.findAllForAdmin();
    }

    // Remover uma avaliação inadequada.
    @Delete('admin/:reviewId')
    @UseGuards(JwtAuthGuard)
    async removerAvaliacao(
        @Param('reviewId') reviewId: string,
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'ADMIN') {
            throw new ForbiddenException(
                'Apenas administradores podem remover avaliações.',
            );
        }

        return this.reviewsService.removerAvaliacao(reviewId);
    }

    // Consultar denúncias para análise administrativa.
    @Get('admin/denuncias')
    @UseGuards(JwtAuthGuard)
    async listarDenuncias(
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'ADMIN') {
            throw new ForbiddenException(
                'Apenas administradores podem consultar denúncias.',
            );
        }

        return this.reviewsService.findReportsForAdmin();
    }

    // Atualizar o status de uma denúncia.
    @Patch('admin/denuncias/:reportId/status')
    @UseGuards(JwtAuthGuard)
    async atualizarStatusDenuncia(
        @Param('reportId') reportId: string,
        @Body('status') status: string,
        @Req() request: AuthenticatedRequest,
    ) {
        if (request.user.role !== 'ADMIN') {
            throw new ForbiddenException(
                'Apenas administradores podem atualizar denúncias.',
            );
        }

        return this.reviewsService.atualizarStatusDenuncia(
            reportId,
            status,
        );
    }
}

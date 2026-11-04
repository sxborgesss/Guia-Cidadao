
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
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

    // Criar avaliação usando a identidade do JWT
    @Post()
    @UseGuards(JwtAuthGuard)
    async criar(
        @Body() body: any,
        @Req() request: AuthenticatedRequest,
    ) {
        const serviceId = body.service_id || body.serviceId;
        const nota = Number(body.nota);
        const comentario = body.comentario;

        const userId = request.user.id;

        return this.reviewsService.create(
            {
                nota,
                comentario,
                service_id: serviceId,
            },
            userId,
        );
    }

    // Consultar avaliações públicas de um serviço
    @Get('service/:serviceId')
    async listarPorServico(
        @Param('serviceId') serviceId: string,
    ) {
        return this.reviewsService.findByService(serviceId);
    }

    // Consultar avaliações dos serviços do gestor autenticado
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

    // Responder oficialmente a uma avaliação
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
}

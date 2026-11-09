
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { ReviewResponse } from './entities/review-response.entity';
import {
    ReviewReport,
    ReviewReportStatus,
} from './entities/review-report.entity';
import { PublicService } from '../services/entities/service.entity';

export class CreateReviewDto {
    nota: number;
    comentario: string;
    service_id: string;
    isAnonimo?: boolean;
}

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,

        @InjectRepository(PublicService)
        private readonly serviceRepository: Repository<PublicService>,

        @InjectRepository(ReviewResponse)
        private readonly responseRepository: Repository<ReviewResponse>,

        @InjectRepository(ReviewReport)
        private readonly reportRepository: Repository<ReviewReport>,
    ) {}

    async create(
        dto: CreateReviewDto,
        userId: string,
    ): Promise<Review> {
        const servico = await this.serviceRepository.findOne({
            where: { id: dto.service_id },
        });

        if (!servico) {
            throw new NotFoundException(
                'Serviço público não encontrado.',
            );
        }

        const novaReview = this.reviewRepository.create({
            nota: dto.nota,
            comentario: dto.comentario,
            isAnonimo: dto.isAnonimo ?? false,
            service_id: dto.service_id,
            user_id: userId,
        });

        const reviewSalva = await this.reviewRepository.save(
            novaReview,
        );

        const todasReviews = await this.reviewRepository.find({
            where: { service_id: dto.service_id },
        });

        const total = todasReviews.length;

        const soma = todasReviews.reduce(
            (acc, item) => acc + item.nota,
            0,
        );

        const novaMedia = parseFloat(
            (soma / total).toFixed(1),
        );

        servico.totalAvaliacoes = total;
        servico.mediaNota = novaMedia;

        await this.serviceRepository.save(servico);

        return reviewSalva;
    }

    // Consulta pública com dados limitados e resposta institucional.
    async findByService(serviceId: string) {
        const reviews = await this.reviewRepository
            .createQueryBuilder('review')
            .leftJoin('review.user', 'user')
            .leftJoin(
                'review.respostaInstitucional',
                'resposta',
            )
            .select([
                'review.id',
                'review.nota',
                'review.comentario',
                'review.created_at',
                'review.isAnonimo',

                'user.id',
                'user.nome',

                'resposta.id',
                'resposta.resposta',
                'resposta.created_at',
            ])
            .where('review.service_id = :serviceId', {
                serviceId,
            })
            .orderBy('review.created_at', 'DESC')
            .getMany();

        return reviews.map((review) => ({
            ...review,
            user: review.isAnonimo
                ? { nome: 'Cidadão anônimo' }
                : { nome: review.user?.nome || 'Cidadão' },
        }));
    }

    // Consulta as avaliações dos serviços vinculados ao gestor.
    // Também carrega as respostas e preserva o anonimato.
    async findByGestor(gestorId: string) {
        const reviews = await this.reviewRepository
            .createQueryBuilder('review')
            .innerJoin('review.service', 'service')
            .innerJoin(
                'service.gestores',
                'gestor',
                'gestor.id = :gestorId',
                { gestorId },
            )
            .leftJoin('review.user', 'user')
            .leftJoin(
                'review.respostaInstitucional',
                'resposta',
            )
            .select([
                'review.id',
                'review.nota',
                'review.comentario',
                'review.service_id',
                'review.isAnonimo',
                'review.created_at',

                'service.id',
                'service.nome',

                'user.nome',

                'resposta.id',
                'resposta.resposta',
                'resposta.created_at',
            ])
            .orderBy('review.created_at', 'DESC')
            .getMany();

        return reviews.map((review) => ({
            ...review,
            user: review.isAnonimo
                ? { nome: 'Cidadão anônimo' }
                : { nome: review.user?.nome || 'Cidadão' },
        }));
    }

    // Consulta todas as avaliações para moderação administrativa.
    async findAllForAdmin() {
        const reviews = await this.reviewRepository
            .createQueryBuilder('review')
            .leftJoin('review.user', 'user')
            .leftJoin('review.service', 'service')
            .leftJoin(
                'review.respostaInstitucional',
                'resposta',
            )
            .select([
                'review.id',
                'review.nota',
                'review.comentario',
                'review.service_id',
                'review.isAnonimo',
                'review.created_at',

                'service.id',
                'service.nome',

                'user.nome',

                'resposta.id',
                'resposta.resposta',
                'resposta.created_at',
            ])
            .orderBy('review.created_at', 'DESC')
            .getMany();

        return reviews.map((review) => ({
            ...review,
            user: review.isAnonimo
                ? { nome: 'Cidadão anônimo' }
                : { nome: review.user?.nome || 'Cidadão' },
        }));
    }

    // Exclusão administrativa e atualização das estatísticas do serviço.
    async removerAvaliacao(reviewId: string) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundException(
                'Avaliação não encontrada.',
            );
        }

        const serviceId = review.service_id;

        await this.reviewRepository.remove(review);

        // Recalcula as estatísticas depois da exclusão.
        const reviewsRestantes = await this.reviewRepository.find({
            where: { service_id: serviceId },
        });

        const total = reviewsRestantes.length;

        const soma = reviewsRestantes.reduce(
            (acc, item) => acc + item.nota,
            0,
        );

        const servico = await this.serviceRepository.findOne({
            where: { id: serviceId },
        });

        if (servico) {
            servico.totalAvaliacoes = total;
            servico.mediaNota =
                total > 0
                    ? parseFloat((soma / total).toFixed(1))
                    : 0;

            await this.serviceRepository.save(servico);
        }

        return {
            message: 'Avaliação removida com sucesso.',
            serviceId,
            totalAvaliacoes: total,
        };
    }

    // Registrar denúncia feita por um cidadão.
    async denunciarAvaliacao(
        reviewId: string,
        reporterId: string,
        motivo: string,
        descricao?: string,
    ) {
        if (!motivo || !motivo.trim()) {
            throw new BadRequestException(
                'Informe o motivo da denúncia.',
            );
        }

        if (motivo.trim().length > 100) {
            throw new BadRequestException(
                'O motivo deve ter no máximo 100 caracteres.',
            );
        }

        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundException(
                'Avaliação não encontrada.',
            );
        }

        // Impede que o mesmo cidadão denuncie repetidamente
        // a mesma avaliação.
        const denunciaExistente = await this.reportRepository.findOne({
            where: {
                review: { id: reviewId },
                reporter: { id: reporterId },
            },
        });

        if (denunciaExistente) {
            throw new ConflictException(
                'Você já denunciou esta avaliação.',
            );
        }

        const novaDenuncia = this.reportRepository.create({
            review: { id: reviewId },
            reporter: { id: reporterId },
            motivo: motivo.trim(),
            descricao: descricao?.trim() || null,
            status: ReviewReportStatus.PENDENTE,
        });

        return this.reportRepository.save(novaDenuncia);
    }

    // Consultar denúncias para análise administrativa.
    async findReportsForAdmin() {
        const denuncias = await this.reportRepository
            .createQueryBuilder('denuncia')
            .leftJoinAndSelect('denuncia.review', 'review')
            .leftJoinAndSelect('review.service', 'service')
            .leftJoin('review.user', 'autor')
            .leftJoin('denuncia.reporter', 'reporter')
            .select([
                'denuncia.id',
                'denuncia.motivo',
                'denuncia.descricao',
                'denuncia.status',
                'denuncia.created_at',
                'denuncia.updated_at',

                'review.id',
                'review.nota',
                'review.comentario',
                'review.isAnonimo',
                'review.created_at',

                'service.id',
                'service.nome',

                'autor.nome',

                'reporter.id',
                'reporter.nome',
            ])
            .orderBy('denuncia.created_at', 'DESC')
            .getMany();

        return denuncias.map((denuncia) => ({
            id: denuncia.id,
            motivo: denuncia.motivo,
            descricao: denuncia.descricao,
            status: denuncia.status,
            created_at: denuncia.created_at,
            updated_at: denuncia.updated_at,

            review: denuncia.review
                ? {
                    id: denuncia.review.id,
                    nota: denuncia.review.nota,
                    comentario: denuncia.review.comentario,
                    isAnonimo: denuncia.review.isAnonimo,
                    created_at: denuncia.review.created_at,
                    service: denuncia.review.service
                        ? {
                            id: denuncia.review.service.id,
                            nome: denuncia.review.service.nome,
                        }
                        : null,
                    user: denuncia.review.isAnonimo
                        ? { nome: 'Cidadão anônimo' }
                        : {
                            nome: denuncia.review.user?.nome || 'Cidadão',
                        },
                }
                : null,

            reporter: {
                id: denuncia.reporter?.id,
                nome: denuncia.reporter?.nome || 'Cidadão',
            },
        }));
    }

    // Atualizar o status de uma denúncia.
    async atualizarStatusDenuncia(
        reportId: string,
        status: string,
    ) {
        if (
            !Object.values(ReviewReportStatus).includes(
                status as ReviewReportStatus,
            )
        ) {
            throw new BadRequestException(
                'Status de denúncia inválido.',
            );
        }

        const denuncia = await this.reportRepository.findOne({
            where: { id: reportId },
        });

        if (!denuncia) {
            throw new NotFoundException(
                'Denúncia não encontrada.',
            );
        }

        denuncia.status = status as ReviewReportStatus;

        return this.reportRepository.save(denuncia);
    }

    // Resposta institucional do gestor.
    async responderAvaliacao(
        reviewId: string,
        gestorId: string,
        resposta: string,
    ): Promise<ReviewResponse> {
        if (!resposta || !resposta.trim()) {
            throw new BadRequestException(
                'A resposta não pode estar vazia.',
            );
        }

        const review = await this.reviewRepository
            .createQueryBuilder('review')
            .innerJoinAndSelect('review.service', 'service')
            .innerJoin(
                'service.gestores',
                'gestor',
                'gestor.id = :gestorId',
                { gestorId },
            )
            .where('review.id = :reviewId', { reviewId })
            .getOne();

        if (!review) {
            const existe = await this.reviewRepository.exists({
                where: { id: reviewId },
            });

            if (!existe) {
                throw new NotFoundException(
                    'Avaliação não encontrada.',
                );
            }

            throw new ForbiddenException(
                'Você não administra o serviço desta avaliação.',
            );
        }

        const respostaExistente = await this.responseRepository
            .createQueryBuilder('resposta')
            .innerJoin('resposta.review', 'review')
            .where('review.id = :reviewId', { reviewId })
            .getOne();

        if (respostaExistente) {
            throw new ConflictException(
                'Esta avaliação já possui uma resposta institucional.',
            );
        }

        const novaResposta = this.responseRepository.create({
            resposta: resposta.trim(),
            review,
            gestor: { id: gestorId },
        });

        return this.responseRepository.save(novaResposta);
    }
}

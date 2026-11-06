
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

    async findByGestor(gestorId: string): Promise<Review[]> {
        return this.reviewRepository
            .createQueryBuilder('review')
            .innerJoin('review.service', 'service')
            .innerJoin(
                'service.gestores',
                'gestor',
                'gestor.id = :gestorId',
                { gestorId },
            )
            .leftJoin('review.user', 'user')
            .select([
                'review.id',
                'review.nota',
                'review.comentario',
                'review.service_id',
                'review.user_id',
                'review.created_at',
                'service.id',
                'service.nome',
                'user.id',
                'user.nome',
            ])
            .orderBy('review.created_at', 'DESC')
            .getMany();
    }

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

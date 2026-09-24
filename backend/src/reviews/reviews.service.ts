import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { PublicService } from '../services/entities/service.entity';

export class CreateReviewDto {
  nota: number;
  comentario: string;
  service_id: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(PublicService)
    private readonly serviceRepository: Repository<PublicService>,
  ) {}

  async create(dto: CreateReviewDto, userId: string): Promise<Review> {
    const servico = await this.serviceRepository.findOne({
      where: { id: dto.service_id },
    });

    if (!servico) {
      throw new NotFoundException('Serviço público não encontrado.');
    }

    const novaReview = this.reviewRepository.create({
      nota: dto.nota,
      comentario: dto.comentario,
      service_id: dto.service_id,
      user_id: userId,
    });

    const reviewSalva = await this.reviewRepository.save(novaReview);

    // Recalcular a média e total de avaliações do serviço
    const todasReviews = await this.reviewRepository.find({
      where: { service_id: dto.service_id },
    });

    const total = todasReviews.length;
    const soma = todasReviews.reduce((acc, item) => acc + item.nota, 0);
    const novaMedia = parseFloat((soma / total).toFixed(1));

    servico.totalAvaliacoes = total;
    servico.mediaNota = novaMedia;
    await this.serviceRepository.save(servico);

    return reviewSalva;
  }

  async findByService(serviceId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { service_id: serviceId },
      relations: {
        user: true,
      },
      order: { created_at: 'DESC' },
    });
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) {}

    async create(
        createReviewDto: CreateReviewDto,
        userId: string,
    ): Promise<Review> {
        const review = this.reviewRepository.create({
            ...createReviewDto,
            user_id: userId,
        });

        return this.reviewRepository.save(review);
    }

    async findByService(serviceId: string): Promise<Review[]> {
        return this.reviewRepository.find({
            where: {
                service_id: serviceId,
            },
            relations: {
                user: true,
            },
            order: {
                created_at: 'DESC',
            },
        });
    }
}
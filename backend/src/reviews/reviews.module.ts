
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { Review } from './entities/review.entity';
import { ReviewResponse } from './entities/review-response.entity';
import { ReviewReport } from './entities/review-report.entity';
import { PublicService } from '../services/entities/service.entity';

import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
    imports: [
        PassportModule.register({}),
        TypeOrmModule.forFeature([
            Review,
            ReviewResponse,
            ReviewReport,
            PublicService,
        ]),
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule {}

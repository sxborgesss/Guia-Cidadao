import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { ReviewsService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Request() req: any) {
    const userId = req.user.sub || req.user.id || req.user.userId;

    if (!userId) {
      throw new Error('Não foi possível identificar o utilizador no token.');
    }

    return this.reviewsService.create(createReviewDto, userId);
  }

  @Get('service/:serviceId')
  findByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByService(serviceId);
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

export class CreateReviewBodyDto {
  nota: number;
  comentario: string;
  service_id: string;
  user_id: string;
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async criar(@Body() body: any) {
    const serviceId = body.service_id || body.serviceId;
    const userId = body.user_id || body.userId;
    const nota = Number(body.nota);
    const comentario = body.comentario;

    return this.reviewsService.create(
      {
        nota,
        comentario,
        service_id: serviceId,
      },
      userId,
    );
  }

  @Get('service/:serviceId')
  async listarPorServico(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByService(serviceId);
  }
}
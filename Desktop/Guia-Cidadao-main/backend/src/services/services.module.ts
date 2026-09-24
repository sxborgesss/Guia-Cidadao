import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicService } from './entities/service.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PublicService])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
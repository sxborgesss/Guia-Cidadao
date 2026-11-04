
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { PublicService } from './entities/service.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
    imports: [
        PassportModule.register({}),
        TypeOrmModule.forFeature([PublicService]),
    ],
    controllers: [ServicesController],
    providers: [
        ServicesService,
        RolesGuard,
    ],
    exports: [ServicesService],
})
export class ServicesModule {}

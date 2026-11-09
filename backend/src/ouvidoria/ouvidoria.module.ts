import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { Manifestacao } from './entities/manifestacao.entity';
import { User } from '../users/entities/user.entity';

import { OuvidoriaController } from './ouvidoria.controller';
import { OuvidoriaService } from './ouvidoria.service';

@Module({
    imports: [
        PassportModule.register({}),
        TypeOrmModule.forFeature([
            Manifestacao,
            User,
        ]),
    ],
    controllers: [
        OuvidoriaController,
    ],
    providers: [
        OuvidoriaService,
    ],
    exports: [
        OuvidoriaService,
    ],
})
export class OuvidoriaModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { User } from './entities/user.entity';
import { PublicService } from '../services/entities/service.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
    imports: [
        PassportModule.register({}),
        TypeOrmModule.forFeature([
            User,
            PublicService,
        ]),
    ],
    controllers: [UsersController],
    providers: [
        UsersService,
        RolesGuard,
    ],
    exports: [UsersService],
})
export class UsersModule {}

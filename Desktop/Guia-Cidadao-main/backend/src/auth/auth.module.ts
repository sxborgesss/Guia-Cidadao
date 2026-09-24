import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
    imports: [
        UsersModule,

        PassportModule,

        JwtModule.register({
            secret: 'chave-secreta-temporaria',
            signOptions: {
                expiresIn: '1h',
            },
        }),
    ],

    controllers: [AuthController],

    providers: [
        AuthService,
        JwtStrategy,
        RolesGuard,
    ],

    exports: [AuthService],
})
export class AuthModule {}
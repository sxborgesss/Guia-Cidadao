import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'chave-secreta-temporaria',
        });
    }

    async validate(payload: {
        sub: string;
        email: string;
        role: string;
    }) {

        const usuario = await this.usersService.buscarPorId(payload.sub);

        return usuario;
    }
}
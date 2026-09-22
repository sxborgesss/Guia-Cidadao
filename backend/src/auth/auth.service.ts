import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';


@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async registrar(
        nome: string,
        email: string,
        senha: string,
    ) {

        const usuarioExistente = await this.usersService.buscarPorEmail(email);

        if (usuarioExistente) {
            throw new ConflictException('Este e-mail já está cadastrado');
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const user = new User();

        user.nome = nome;
        user.email = email;
        user.senha = senhaCriptografada;
        user.role = UserRole.CIDADAO;

        const usuarioCriado = await this.usersService.criar(user);

        return {
            id: usuarioCriado.id,
            nome: usuarioCriado.nome,
            email: usuarioCriado.email,
            role: usuarioCriado.role,
            created_at: usuarioCriado.created_at,
            updated_at: usuarioCriado.updated_at,
        };
    }

    async login(email: string, senha: string) {

        const usuario = await this.usersService.buscarPorEmail(email);

        if (!usuario) {
            throw new UnauthorizedException('E-mail ou senha inválidos');
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha,
        );

        if (!senhaCorreta) {
            throw new UnauthorizedException('E-mail ou senha inválidos');
        }

        const payload = {
            sub: usuario.id,
            email: usuario.email,
            role: usuario.role,
        };

        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token,

            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
            },
        };
    }
    async criarUsuarioComoAdmin(
        nome: string,
        email: string,
        senha: string,
        role: UserRole,
    ) {

        const usuarioExistente = await this.usersService.buscarPorEmail(email);

        if (usuarioExistente) {
            throw new ConflictException('Este e-mail já está cadastrado');
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const user = new User();

        user.nome = nome;
        user.email = email;
        user.senha = senhaCriptografada;
        user.role = role;

        const usuarioCriado = await this.usersService.criar(user);

        return {
            id: usuarioCriado.id,
            nome: usuarioCriado.nome,
            email: usuarioCriado.email,
            role: usuarioCriado.role,
            created_at: usuarioCriado.created_at,
        };
    }
}
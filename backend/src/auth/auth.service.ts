import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async registrar(
        nome: string,
        email: string,
        senha: string,
    ) {
        const usuarioExistente =
            await this.usersService.buscarPorEmail(email);

        if (usuarioExistente) {
            throw new ConflictException(
                'Este e-mail já está cadastrado',
            );
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
            throw new UnauthorizedException(
                'E-mail ou senha inválidos',
            );
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha,
        );

        if (!senhaCorreta) {
            throw new UnauthorizedException(
                'E-mail ou senha inválidos',
            );
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
        const usuarioExistente =
            await this.usersService.buscarPorEmail(email);

        if (usuarioExistente) {
            throw new ConflictException(
                'Este e-mail já está cadastrado',
            );
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

    // Solicita a recuperação de senha
    async solicitarRecuperacaoSenha(email: string) {
        const resposta = {
            message:
                'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.',
        };

        const usuario = await this.usersService.buscarPorEmail(email);

        // Não revela se o e-mail existe no sistema.
        if (!usuario) {
            return resposta;
        }

        // Gera um token aleatório.
        const token = randomBytes(32).toString('hex');

        // Armazena somente o hash do token no banco.
        const tokenHash = createHash('sha256')
            .update(token)
            .digest('hex');

        // Define validade de 30 minutos.
        usuario.passwordResetTokenHash = tokenHash;
        usuario.passwordResetExpiresAt = new Date(
            Date.now() + 30 * 60 * 1000,
        );

        await this.usersService.criar(usuario);

        const frontendUrl =
            this.configService.get<string>('FRONTEND_URL') ||
            'http://localhost:3000';

        const linkRecuperacao =
            `${frontendUrl.replace(/\/+$/, '')}` +
            `/recuperar-senha?token=${encodeURIComponent(token)}`;

        try {
            await this.mailService.enviarEmailRecuperacao(
                usuario.email,
                usuario.nome,
                linkRecuperacao,
            );
        } catch {
            // Não registra token, senha ou dados pessoais no log.
            this.logger.error(
                'Não foi possível enviar o e-mail de recuperação.',
            );
        }

        return resposta;
    }

    // Redefine a senha usando o token recebido por e-mail.
    async redefinirSenha(
        token: string,
        novaSenha: string,
    ) {
        const tokenHash = createHash('sha256')
            .update(token)
            .digest('hex');

        const usuario = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.passwordResetTokenHash')
            .addSelect('user.passwordResetExpiresAt')
            .where(
                'user.passwordResetTokenHash = :tokenHash',
                { tokenHash },
            )
            .andWhere(
                'user.passwordResetExpiresAt > :agora',
                { agora: new Date() },
            )
            .getOne();

        if (!usuario) {
            throw new BadRequestException(
                'Token inválido ou expirado. Solicite uma nova recuperação de senha.',
            );
        }

        const senhaCriptografada = await bcrypt.hash(
            novaSenha,
            10,
        );

        usuario.senha = senhaCriptografada;

        // Invalida o token após a utilização.
        usuario.passwordResetTokenHash = null;
        usuario.passwordResetExpiresAt = null;

        await this.userRepository.save(usuario);

        return {
            message: 'Senha redefinida com sucesso.',
        };
    }
}
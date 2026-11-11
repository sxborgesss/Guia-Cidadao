import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    UseGuards,
} from '@nestjs/common';

import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    Matches,
} from 'class-validator';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

// DTO para solicitar recuperação
class ForgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

// DTO para redefinir a senha
class ResetPasswordDto {
    @IsString()
    @Length(64, 64)
    @Matches(/^[a-fA-F0-9]{64}$/)
    token: string;

    @IsString()
    @IsNotEmpty()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,64}$/,
        {
            message:
                'A senha deve ter entre 8 e 64 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial.',
        },
    )
    novaSenha: string;
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    async registrar(@Body() registerDto: RegisterDto) {
        return this.authService.registrar(
            registerDto.nome,
            registerDto.email,
            registerDto.senha,
        );
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(
            loginDto.email,
            loginDto.senha,
        );
    }

    @Post('forgot-password')
    @HttpCode(200)
    async solicitarRecuperacao(
        @Body() dto: ForgotPasswordDto,
    ) {
        return this.authService.solicitarRecuperacaoSenha(
            dto.email,
        );
    }

    @Post('reset-password')
    @HttpCode(200)
    async redefinirSenha(
        @Body() dto: ResetPasswordDto,
    ) {
        return this.authService.redefinirSenha(
            dto.token,
            dto.novaSenha,
        );
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    getProfile() {
        return {
            mensagem: 'Você está autenticado!',
        };
    }

    @Post('admin/users')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async criarUsuarioComoAdmin(
        @Body() adminCreateUserDto: AdminCreateUserDto,
    ) {
        return this.authService.criarUsuarioComoAdmin(
            adminCreateUserDto.nome,
            adminCreateUserDto.email,
            adminCreateUserDto.senha,
            adminCreateUserDto.role,
        );
    }
}
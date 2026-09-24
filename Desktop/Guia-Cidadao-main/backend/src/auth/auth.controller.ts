import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

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
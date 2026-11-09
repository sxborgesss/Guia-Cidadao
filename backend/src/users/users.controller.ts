
import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) {}

    // Listar todos os gestores
    @Get('gestores')
    @Roles('ADMIN')
    async listarGestores() {
        return this.usersService.listarGestores();
    }

    // Listar os serviços do próprio gestor autenticado
    @Get('gestor/meus-servicos')
    @Roles('GESTOR')
    async listarMeusServicos(@Req() request: any) {
        return this.usersService.listarServicosDoGestor(
            request.user.id,
        );
    }

    // Listar os serviços vinculados a um gestor
    @Get('gestores/:gestorId/servicos')
    @Roles('ADMIN')
    async listarServicosDoGestor(
        @Param('gestorId') gestorId: string,
    ) {
        return this.usersService.listarServicosDoGestor(
            gestorId,
        );
    }

    // Vincular um gestor a um serviço
    @Post('gestores/:gestorId/servicos/:serviceId')
    @Roles('ADMIN')
    async vincularServico(
        @Param('gestorId') gestorId: string,
        @Param('serviceId') serviceId: string,
    ) {
        return this.usersService.vincularServico(
            gestorId,
            serviceId,
        );
    }

    // Desvincular um gestor de um serviço
    @Delete('gestores/:gestorId/servicos/:serviceId')
    @Roles('ADMIN')
    async desvincularServico(
        @Param('gestorId') gestorId: string,
        @Param('serviceId') serviceId: string,
    ) {
        return this.usersService.desvincularServico(
            gestorId,
            serviceId,
        );
    }
}

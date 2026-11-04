
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import {
    ServicesService,
    CreateServiceDto,
} from './services.service';

import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('services')
export class ServicesController {
    constructor(
        private readonly servicesService: ServicesService,
    ) {}

    // Consulta pública: qualquer cidadão pode visualizar serviços.
    @Get()
    async listarTodos() {
        return this.servicesService.findAll();
    }

    // Somente ADMIN pode cadastrar serviços.
    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async criar(@Body() dto: CreateServiceDto) {
        return this.servicesService.create(dto);
    }

    // Somente ADMIN pode excluir serviços.
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async remover(@Param('id') id: string) {
        await this.servicesService.remove(id);

        return {
            mensagem: 'Serviço removido com sucesso',
        };
    }
}

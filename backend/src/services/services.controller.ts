import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import {
    ServicesService,
    CreateServiceDto,
    UpdateServiceDto,
} from './services.service';

import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('services')
export class ServicesController {
    constructor(
        private readonly servicesService: ServicesService,
    ) {}

    // Consulta pública dos serviços cadastrados.
    @Get()
    async listarTodos() {
        return this.servicesService.findAll();
    }

    // Cadastro restrito ao ADMIN.
    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async criar(@Body() dto: CreateServiceDto) {
        return this.servicesService.create(dto);
    }

    // Consulta individual de um serviço.
    @Get(':id')
    async buscarUm(@Param('id') id: string) {
        return this.servicesService.findOne(id);
    }

    // Atualização restrita ao ADMIN.
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async atualizar(
        @Param('id') id: string,
        @Body() dto: UpdateServiceDto,
    ) {
        return this.servicesService.update(id, dto);
    }

    // Exclusão restrita ao ADMIN.
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('ADMIN')
    async remover(@Param('id') id: string) {
        await this.servicesService.remove(id);

        return {
            mensagem: 'Serviço removido com sucesso.',
        };
    }
}
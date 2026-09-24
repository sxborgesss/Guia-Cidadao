import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ServicesService, CreateServiceDto } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async listarTodos() {
    return this.servicesService.findAll();
  }

  @Post()
  async criar(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Delete(':id')
  async remover(@Param('id') id: string) {
    await this.servicesService.remove(id);
    return { mensagem: 'Serviço removido com sucesso' };
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicService, ServiceCategory } from './entities/service.entity';

export class CreateServiceDto {
  nome: string;
  categoria: ServiceCategory;
  endereco: string;
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(PublicService)
    private readonly serviceRepository: Repository<PublicService>,
  ) {}

  async findAll(): Promise<PublicService[]> {
    return this.serviceRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async create(dto: CreateServiceDto): Promise<PublicService> {
    const novoServico = this.serviceRepository.create(dto);
    return this.serviceRepository.save(novoServico);
  }

  async remove(id: string): Promise<void> {
    await this.serviceRepository.delete(id);
  }
}
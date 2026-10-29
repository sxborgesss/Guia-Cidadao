import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { PublicService, ServiceCategory } from './entities/service.entity';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsEnum(ServiceCategory, { message: 'Categoria inválida' })
  categoria: ServiceCategory;

  @IsString()
  @IsNotEmpty({ message: 'O endereço é obrigatório' })
  endereco: string;

  // Novos campos adicionados com @IsOptional() para não bloquear caso venham vazios
  @IsString()
  @IsOptional()
  esfera?: string;

  @IsNumber({}, { message: 'A latitude deve ser um número válido' })
  @IsOptional()
  latitude?: number;

  @IsNumber({}, { message: 'A longitude deve ser um número válido' })
  @IsOptional()
  longitude?: number;
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

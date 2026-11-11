import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsNumber,
    MaxLength,
    Min,
    Max,
} from 'class-validator';

import {
    PublicService,
    ServiceCategory,
} from './entities/service.entity';

export class CreateServiceDto {
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    @MaxLength(255)
    nome: string;

    @IsEnum(ServiceCategory, {
        message: 'Categoria inválida.',
    })
    categoria: ServiceCategory;

    @IsString()
    @IsNotEmpty({ message: 'O endereço é obrigatório.' })
    @MaxLength(255)
    endereco: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    esfera?: string;

    @IsNumber()
    @IsOptional()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsNumber()
    @IsOptional()
    @Min(-180)
    @Max(180)
    longitude?: number;
}

export class UpdateServiceDto {
    @IsString()
    @IsNotEmpty({ message: 'O nome não pode ficar vazio.' })
    @IsOptional()
    @MaxLength(255)
    nome?: string;

    @IsEnum(ServiceCategory, {
        message: 'Categoria inválida.',
    })
    @IsOptional()
    categoria?: ServiceCategory;

    @IsString()
    @IsNotEmpty({ message: 'O endereço não pode ficar vazio.' })
    @IsOptional()
    @MaxLength(255)
    endereco?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    esfera?: string;

    @IsNumber()
    @IsOptional()
    @Min(-90)
    @Max(90)
    latitude?: number | null;

    @IsNumber()
    @IsOptional()
    @Min(-180)
    @Max(180)
    longitude?: number | null;
}

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(PublicService)
        private readonly serviceRepository: Repository<PublicService>,
    ) {}

    async findAll(): Promise<PublicService[]> {
        return this.serviceRepository.find({
            order: {
                created_at: 'DESC',
            },
        });
    }

    async findOne(id: string): Promise<PublicService> {
        const servico = await this.serviceRepository.findOne({
            where: { id },
        });

        if (!servico) {
            throw new NotFoundException(
                'Serviço público não encontrado.',
            );
        }

        return servico;
    }

    async create(dto: CreateServiceDto): Promise<PublicService> {
        const novoServico = this.serviceRepository.create({
            ...dto,
            nome: dto.nome.trim(),
            endereco: dto.endereco.trim(),
            esfera: dto.esfera?.trim() || 'Municipal',
        });

        return this.serviceRepository.save(novoServico);
    }

    async update(
        id: string,
        dto: UpdateServiceDto,
    ): Promise<PublicService> {
        const servico = await this.findOne(id);

        const camposEnviados = Object.keys(dto);

        if (camposEnviados.length === 0) {
            throw new BadRequestException(
                'Informe pelo menos um campo para atualizar.',
            );
        }

        if (dto.nome !== undefined) {
            servico.nome = dto.nome.trim();
        }

        if (dto.categoria !== undefined) {
            servico.categoria = dto.categoria;
        }

        if (dto.endereco !== undefined) {
            servico.endereco = dto.endereco.trim();
        }

        if (dto.esfera !== undefined) {
            servico.esfera = dto.esfera.trim();
        }

        if (dto.latitude !== undefined) {
            servico.latitude = dto.latitude as number;
        }

        if (dto.longitude !== undefined) {
            servico.longitude = dto.longitude as number;
        }

        return this.serviceRepository.save(servico);
    }

    async remove(id: string): Promise<void> {
        const servico = await this.findOne(id);

        await this.serviceRepository.remove(servico);
    }
}
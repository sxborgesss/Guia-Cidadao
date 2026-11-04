
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from './entities/user.entity';
import { PublicService } from '../services/entities/service.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(PublicService)
        private readonly serviceRepository: Repository<PublicService>,
    ) {}

    async criar(user: User): Promise<User> {
        return this.userRepository.save(user);
    }

    async buscarPorEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email },
        });
    }

    async buscarPorId(id: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { id },
        });
    }

    async listarGestores() {
        const gestores = await this.userRepository.find({
            where: {
                role: UserRole.GESTOR,
            },
            order: {
                nome: 'ASC',
            },
        });

        return gestores.map((gestor) => ({
            id: gestor.id,
            nome: gestor.nome,
            email: gestor.email,
            role: gestor.role,
            created_at: gestor.created_at,
            updated_at: gestor.updated_at,
        }));
    }

    private async buscarGestor(gestorId: string): Promise<User> {
        const gestor = await this.userRepository.findOne({
            where: {
                id: gestorId,
                role: UserRole.GESTOR,
            },
        });

        if (!gestor) {
            throw new NotFoundException('Gestor não encontrado.');
        }

        return gestor;
    }

    async listarServicosDoGestor(
        gestorId: string,
    ): Promise<PublicService[]> {
        await this.buscarGestor(gestorId);

        return this.serviceRepository
            .createQueryBuilder('servico')
            .innerJoin(
                'servico.gestores',
                'gestor',
                'gestor.id = :gestorId',
                { gestorId },
            )
            .orderBy('servico.nome', 'ASC')
            .getMany();
    }

    async vincularServico(
        gestorId: string,
        serviceId: string,
    ) {
        await this.buscarGestor(gestorId);

        const servico = await this.serviceRepository.findOne({
            where: { id: serviceId },
            relations: {
                gestores: true,
            },
        });

        if (!servico) {
            throw new NotFoundException('Serviço não encontrado.');
        }

        const jaVinculado = servico.gestores.some(
            (gestor) => gestor.id === gestorId,
        );

        if (jaVinculado) {
            return {
                message: 'Gestor já está vinculado a este serviço.',
                gestorId,
                serviceId,
            };
        }

        await this.serviceRepository
            .createQueryBuilder()
            .relation(PublicService, 'gestores')
            .of(serviceId)
            .add(gestorId);

        return {
            message: 'Gestor vinculado ao serviço com sucesso.',
            gestorId,
            serviceId,
        };
    }

    async desvincularServico(
        gestorId: string,
        serviceId: string,
    ) {
        await this.buscarGestor(gestorId);

        const servico = await this.serviceRepository.findOne({
            where: { id: serviceId },
            relations: {
                gestores: true,
            },
        });

        if (!servico) {
            throw new NotFoundException('Serviço não encontrado.');
        }

        const vinculado = servico.gestores.some(
            (gestor) => gestor.id === gestorId,
        );

        if (!vinculado) {
            throw new NotFoundException(
                'Este gestor não está vinculado ao serviço.',
            );
        }

        await this.serviceRepository
            .createQueryBuilder()
            .relation(PublicService, 'gestores')
            .of(serviceId)
            .remove(gestorId);

        return {
            message: 'Gestor desvinculado do serviço com sucesso.',
            gestorId,
            serviceId,
        };
    }
}

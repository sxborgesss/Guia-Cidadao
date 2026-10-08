import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
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
}
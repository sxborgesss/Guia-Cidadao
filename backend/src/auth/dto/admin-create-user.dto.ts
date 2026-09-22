import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    MinLength,
} from 'class-validator';

import { UserRole } from '../../users/entities/user.entity';

export class AdminCreateUserDto {

    @IsNotEmpty()
    nome: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    senha: string;

    @IsEnum(UserRole)
    role: UserRole;
}
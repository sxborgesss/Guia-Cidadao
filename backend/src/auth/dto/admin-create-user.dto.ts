import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    Matches,
} from 'class-validator';

import { UserRole } from '../../users/entities/user.entity';

export class AdminCreateUserDto {

    @IsNotEmpty()
    nome: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,64}$/,
        {
            message:
                'A senha deve ter entre 8 e 64 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial.',
        },
    )
    senha: string;

    @IsEnum(UserRole)
    role: UserRole;
}
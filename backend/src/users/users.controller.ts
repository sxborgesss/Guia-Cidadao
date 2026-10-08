import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) {}

    @Get('gestores')
    @Roles('ADMIN')
    async listarGestores() {
        return this.usersService.listarGestores();
    }
}
import {
    IsUUID,
    IsInt,
    Min,
    Max,
    IsBoolean,
    IsOptional,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';

export class CreateReviewDto {
    @IsUUID()
    service_id: string;

    @IsInt()
    @Min(1)
    @Max(5)
    nota: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    comentario: string;

    @IsOptional()
    @IsBoolean()
    isAnonimo?: boolean;
}
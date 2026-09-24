import {
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  notaGeral: number;

  @IsInt()
  @Min(1)
  @Max(5)
  notaAtendimento: number;

  @IsInt()
  @Min(1)
  @Max(5)
  notaEspera: number;

  @IsInt()
  @Min(1)
  @Max(5)
  notaInfraestrutura: number;

  @IsOptional()
  @IsString()
  relato?: string;

  @IsBoolean()
  isAnonimo: boolean;
}

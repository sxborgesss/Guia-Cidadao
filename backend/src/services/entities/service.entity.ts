import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ServiceCategory {
  SAUDE = 'saude',
  EDUCACAO = 'educacao',
  TRANSPORTE = 'transporte',
  ZELADORIA = 'zeladoria',
}

@Entity('services')
export class PublicService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({
    type: 'enum',
    enum: ServiceCategory,
    default: ServiceCategory.SAUDE,
  })
  categoria: ServiceCategory;

  @Column()
  endereco: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 5.0 })
  mediaNota: number;

  @Column({ type: 'int', default: 0 })
  totalAvaliacoes: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
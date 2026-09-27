import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.model';

/**
 * Catálogo de cargos del restaurante (HU41).
 *
 * La tabla se llama `job_position` porque `position` es una palabra clave
 * en PostgreSQL. La unicidad del nombre (sin distinguir mayúsculas) la
 * garantiza el índice `UQ_job_position_name_lower` de la migración.
 */
@Entity('job_position')
export class Position {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 100, nullable: false })
  name!: string;

  @Column('varchar', { length: 255, nullable: true })
  description?: string | null;

  @Column('boolean', { default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @OneToMany(() => Employee, (employee) => employee.jobPosition)
  employees!: Employee[];
}

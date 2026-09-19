import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PayrollPeriod } from './payroll-period.model';

@Entity()
export class PayrollLine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  concept_name!: string;

  @Column('varchar', { length: 40, nullable: false })
  type!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @ManyToOne(
    () => PayrollPeriod,
    (payrollPeriod) => payrollPeriod.payroll_lines,
  )
  @JoinColumn({ name: 'payroll_period_id' })
  payroll_period!: PayrollPeriod; // singular
}

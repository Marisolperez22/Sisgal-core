import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../modules/empleados/domain/entities/employee.model';

@Entity()
export class DisabilityLeave {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('date')
  start_date!: Date;

  @Column('date')
  end_date!: Date;

  @Column('int')
  total_days!: number;

  @Column('int')
  employee_days!: number;

  @Column('int')
  eps_days!: number;

  @ManyToOne(() => Employee, (employee) => employee.disability_leaves)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;
}

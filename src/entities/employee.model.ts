import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Position } from './position.model';
import { EmployeeBranchAssignment } from './employee-branch-assignment.model';
import { PayrollPeriod } from './payroll-period.model';
import { DisabilityLeave } from './disability_leave.model';
import { AttendanceRecord } from './attendance-record.model';
import { AttendanceLog } from './attendance-log.model';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  firstName!: string;

  @Column('varchar', { length: 40, nullable: false })
  lastName!: string;

  @Column('varchar', { unique: true, nullable: false })
  cedula!: string;

  @Column('decimal', { precision: 13, scale: 2, nullable: false })
  salary_base!: number;

  /**
   * Nombre del cargo al momento del registro. Se conserva como texto para no
   * alterar la información histórica cuando el cargo del catálogo cambia (HU41 CA07).
   */
  @Column('varchar', { length: 40, nullable: false })
  position!: string;

  @ManyToOne(() => Position, (position) => position.employees, {
    nullable: true,
  })
  @JoinColumn({ name: 'position_id' })
  jobPosition?: Position | null;

  @Column('varchar', { length: 40, nullable: false })
  status!: string;

  @OneToMany(
    () => EmployeeBranchAssignment,
    (employee_branch_assig) => employee_branch_assig.employee,
  )
  employee_branch_assig!: EmployeeBranchAssignment[];

  @OneToMany(() => PayrollPeriod, (payroll_period) => payroll_period.employee)
  payroll_periods!: PayrollPeriod[];

  @OneToMany(
    () => DisabilityLeave,
    (disability_leave) => disability_leave.employee,
  )
  disability_leaves!: DisabilityLeave[];

  @OneToMany(
    () => AttendanceRecord,
    (attendance_record) => attendance_record.employee,
  )
  attendance_records!: AttendanceRecord[];

  @OneToMany(() => AttendanceLog, (attendanceLog) => attendanceLog.employee)
  attendanceLogs!: AttendanceLog[];
}

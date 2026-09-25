import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmployeeBranchAssignment } from './employee-branch-assignment.model';
import { PayrollPeriod } from './payroll-period.model';
import { DisabilityLeave } from './disability_leave.model';
import { AttendanceRecord } from './attendance-record.model';
import { AttendanceLog } from './attendance-log.model';
import { WorkdayConfig } from './workday-config.model';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  firstName!: string;

  @Column('varchar', { length: 40, nullable: false })
  lastName!: string;

  @Column('varchar', { length: 40, unique: true, nullable: false })
  document!: string;

  @Column('varchar', { length: 40, nullable: false })
  document_type!: string;

  @Column('varchar', { length: 20, nullable: false })
  phone!: string;

  @Column('decimal', { precision: 13, scale: 2, nullable: false })
  salary_base!: number;

  @Column('varchar', { length: 40, nullable: false })
  position!: string;

  @Column('varchar', { length: 40, nullable: false })
  status!: string;

  @ManyToOne(() => WorkdayConfig, (workdayConfig) => workdayConfig.employees)
  @JoinColumn({ name: 'workday_config_id' })
  workdayConfig!: WorkdayConfig;

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

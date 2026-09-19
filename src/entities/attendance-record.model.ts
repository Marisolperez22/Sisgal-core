import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Branch } from './branch.model';
import { Employee } from './employee.model';
import { AttendanceRecordLog } from './attendance-record-log.model';

@Entity()
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  name!: string;

  @Column('timestamp with time zone')
  check_in!: Date;

  @Column('timestamp with time zone')
  check_out!: Date;

  @Column('int')
  work_minutes!: number;

  @Column('int')
  extra_minutes!: number;

  @Column('int')
  night_minutes!: number;

  @Column('boolean')
  holiday_minutes!: boolean;

  @Column('int')
  is_holiday!: number;

  @ManyToOne(() => Employee, (employee) => employee.attendance_records) // relacion hacia la tabla EMPLOYEE
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => Branch, (branch) => branch.branchConfigs)
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @OneToMany(() => AttendanceRecordLog, (attendanceRecordLog) => attendanceRecordLog.attendanceRecord)
  attendanceRecordLogs!: AttendanceRecordLog[];
}

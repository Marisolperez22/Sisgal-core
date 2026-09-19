import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AttendanceRecordLog } from './attendance-record-log.model';
import { Employee } from './employee.model';
import { BiometricDevice } from './biometric-device.model';

@Entity()
export class AttendanceLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('timestamp with time zone')
  event_time!: Date;

  @Column('varchar', { length: 40, nullable: false })
  event_sign!: string;

  @Column('varchar', { length: 40, nullable: false })
  idempotency_key!: string;

  @ManyToOne(() => Employee, (employee) => employee.attendanceLogs)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => BiometricDevice, (device) => device.attendanceLogs)
  @JoinColumn({ name: 'device_id' })
  biometricDevice!: BiometricDevice;

  @OneToMany(() => AttendanceRecordLog, (attendanceRecordLog) => attendanceRecordLog.attendanceLog)
  attendanceRecordLogs!: AttendanceRecordLog[];
}

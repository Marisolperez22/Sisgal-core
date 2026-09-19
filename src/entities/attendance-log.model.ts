import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { AttendanceRecordLog } from './attendance-record-log.model';

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

  @OneToMany(() => AttendanceRecordLog, (attendanceRecordLog) => attendanceRecordLog.attendanceLog)
attendanceRecordLogs!: AttendanceRecordLog[];
}

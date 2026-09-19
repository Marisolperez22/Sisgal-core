import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AttendanceRecord } from './attendance-record.model';
import { AttendanceLog } from './attendance-log.model';

@Entity()
export class AttendanceRecordLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => AttendanceRecord, (record) => record.attendanceRecordLogs)
  @JoinColumn({ name: 'attendance_record_id' })
  attendanceRecord!: AttendanceRecord;

  @ManyToOne(() => AttendanceLog, (log) => log.attendanceRecordLogs)
  @JoinColumn({ name: 'attendance_log_id' })
  attendanceLog!: AttendanceLog;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Branch } from './branch.model';
import { AttendanceLog } from './attendance-log.model';

@Entity()
export class BiometricDevice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  ip_address!: string;

  @Column('int')
  port!: number;

  @Column('varchar', { length: 100, nullable: false })
  serial_number!: string;

  @Column('timestamp')
  last_sync_at!: Date;

  @ManyToOne(() => Branch, (branch) => branch.biometricDevices)
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @OneToMany(() => AttendanceLog, (attendanceLog) => attendanceLog.biometricDevice)
  attendanceLogs!: AttendanceLog[];
}

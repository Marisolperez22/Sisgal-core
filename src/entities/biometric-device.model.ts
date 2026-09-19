import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Branch } from './branch.model';

@Entity()
export class BiometricDevice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  ip_address!: string;

  @Column('int')
  port!: number;

  @Column('boolean')
  is_acive!: boolean;

  @Column('varchar', { length: 100, nullable: false })
  serial_number!: string;

  @Column('varchar', { length: 100, nullable: false })
  record_user!: string;

  @ManyToOne(() => Branch, (branch) => branch.biometricDevices)
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;
}

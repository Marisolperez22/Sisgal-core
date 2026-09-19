import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Company } from './company.model';
import { BranchConfig } from './branch-config.model';
import { EmployeeBranchAssignment } from './employee-branch-assignment.model';
import { BiometricDevice } from './biometric-device.model';
import { AttendanceRecord } from './attendance-record.model';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  name!: string;

  @Column('varchar', { length: 40, nullable: false })
  nit!: string;

  @Column('boolean')
  is_active!: boolean;

  @ManyToOne(() => Company, (company) => company.branches)
  @JoinColumn({ name: 'company_id' })
  company!: Company; 

  @OneToMany(() => BranchConfig, (branchConfig) => branchConfig.branch)
  branchConfigs!: BranchConfig[];

  @OneToMany(() => EmployeeBranchAssignment, (assignment) => assignment.branch)
  employeeAssignments!: EmployeeBranchAssignment[];

  @OneToMany(() => BiometricDevice, (device) => device.branch)
  biometricDevices!: BiometricDevice[];

  @OneToMany(()=>AttendanceRecord, (attendance_record)=>attendance_record.employee)
  attendance_records!: AttendanceRecord[];
  
}

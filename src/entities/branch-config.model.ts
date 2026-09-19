import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Branch } from './branch.model';


@Entity()
export class BranchConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  config_key!: string;

  @Column('varchar', { length: 40, nullable: false })
  config_value!: string;

  @ManyToOne(() => Branch, (branch) => branch.branchConfigs)
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

}

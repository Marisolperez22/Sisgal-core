import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Branch } from './branch.model';


@Entity()
export class BranchConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  name!: string;

  @Column('varchar', { length: 40, nullable: false })
  nit!: string;

  @Column('boolean')
  is_acive!: boolean;

  @ManyToOne(() => Branch, (branch) => branch.branchConfigs)
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

}

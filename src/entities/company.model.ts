import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Branch } from './branch.model';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 40, nullable: false })
  name!: string;

  @Column('varchar', { length: 40, nullable: false })
  nit!: string;

  @Column('boolean')
  is_acive!: boolean;

  @OneToMany(() => Branch, (branch) => branch.company)
  branches!: Branch[];
}

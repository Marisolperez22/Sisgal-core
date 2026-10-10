import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('holiday')
export class Holiday {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'date',
    unique: true,
  })
  date!: Date;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;
}
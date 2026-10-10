import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class WorkRateConfig {
  @PrimaryColumn('varchar', { length: 40 })
  type!: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: false })
  multiplier!: number;

  @Column('date')
  valid_from!: Date;

  @Column('date', { nullable: true })
  valid_to!: Date | null;
}

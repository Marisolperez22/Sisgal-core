import { Entity, Column,PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class WorkdayConfig{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("int")
    max_week_hour!:number;
     
    @Column("int")
    max_day_hour!:number;

    @Column("time")
    day_start!:string;

    @Column("time")
    day_end!:string;

    @Column("time")
    night_start!:string;

    @Column("time")
    night_end!:string;

    @Column("date")
    valid_from!:Date;

    @Column("date")
    valid_to!:Date;
    

}
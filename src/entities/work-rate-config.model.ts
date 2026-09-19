import { Entity, Column,PrimaryColumn } from 'typeorm';


@Entity()
export class WorkRateConig{
    @PrimaryColumn("varchar")
    type!: string;

    @Column("decimal", {precision: 12, scale:2, nullable: false})
    multiplier!:number;

    @Column("date")
    valid_from!:Date;

    @Column("date")
    valid_to!:Date;
    

}
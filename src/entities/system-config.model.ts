import { Entity, Column, PrimaryColumn } from 'typeorm';


@Entity()
export class SystemConfig{
    @PrimaryColumn("varchar")
    key!: string;

    @Column("decimal", {precision: 12, scale:2, nullable: false})
    value!:number;

    @Column("date")
    valid_from!:Date;

    @Column("date")
    valid_to!:Date;
    

}
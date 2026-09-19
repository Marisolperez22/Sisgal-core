import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployee1789529494054 implements MigrationInterface {
    name = 'CreateEmployee1789529494054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employee" ("id" SERIAL NOT NULL, "firstName" character varying(40) NOT NULL, "lastName" character varying(40) NOT NULL, "cedula" character varying NOT NULL, "salary_base" numeric(13,2) NOT NULL, "position" character varying(40) NOT NULL, "status" character varying(40) NOT NULL, CONSTRAINT "UQ_6c6d44d481e3906d2fa6edb900e" UNIQUE ("cedula"), CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "employee"`);
    }

}

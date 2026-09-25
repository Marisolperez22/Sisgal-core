import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEmployeeFields1790294580938 implements MigrationInterface {
    name = 'UpdateEmployeeFields1790294580938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "UQ_6c6d44d481e3906d2fa6edb900e"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "cedula"`);
        await queryRunner.query(`ALTER TABLE "branch" ADD "branch_addres" character varying(60) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "document" character varying(40) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "UQ_8438ee28d3a542b106dcd8d7289" UNIQUE ("document")`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "document_type" character varying(40) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "phone" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "workday_config_id" integer`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_ebe7764f46be23b3833a38642aa" FOREIGN KEY ("workday_config_id") REFERENCES "workday_config"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_ebe7764f46be23b3833a38642aa"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "workday_config_id"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "document_type"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "UQ_8438ee28d3a542b106dcd8d7289"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "document"`);
        await queryRunner.query(`ALTER TABLE "branch" DROP COLUMN "branch_addres"`);
        await queryRunner.query(`ALTER TABLE "employee" ADD "cedula" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "UQ_6c6d44d481e3906d2fa6edb900e" UNIQUE ("cedula")`);
    }

}

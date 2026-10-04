import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddDisabilityLeaveType1791059891289 implements MigrationInterface {
    name = 'AddDisabilityLeaveType1791059891289'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disability_leave" ADD "type" character varying(40) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disability_leave" DROP COLUMN "type"`);
    }

}

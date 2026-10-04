import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddDisabilityLeaveOtherTypeDescription1791060844659 implements MigrationInterface {
    name = 'AddDisabilityLeaveOtherTypeDescription1791060844659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disability_leave" ADD "other_type_description" character varying(200)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disability_leave" DROP COLUMN "other_type_description"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEmployeeFields1790218290137 implements MigrationInterface {
    name = 'UpdateEmployeeFields1790218290137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branch" ADD "phone" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branch" DROP COLUMN "phone"`);
    }

}

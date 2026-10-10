import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowOpenEndedPayrollConfigurations1790999999999 implements MigrationInterface {
  name = 'AllowOpenEndedPayrollConfigurations1790999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "work_rate_config" ALTER COLUMN "valid_to" DROP NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "workday_config" ALTER COLUMN "valid_to" DROP NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "work_rate_config" ALTER COLUMN "valid_to" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "workday_config" ALTER COLUMN "valid_to" SET NOT NULL',
    );
  }
}

import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * HU41 - Parametrización de cargos.
 *
 * Crea el catálogo `job_position`, lo enlaza a `employee` mediante `position_id`
 * y lo precarga con los cargos que ya existen como texto en `employee.position`.
 * La columna de texto se conserva como copia histórica (CA07).
 */
export class CreatePositionCatalog1790380800000 implements MigrationInterface {
    name = 'CreatePositionCatalog1790380800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "job_position" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_job_position" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_job_position_name_lower" ON "job_position" (LOWER("name"))`);

        await queryRunner.query(`ALTER TABLE "employee" ADD "position_id" integer`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_employee_job_position" FOREIGN KEY ("position_id") REFERENCES "job_position"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE INDEX "IDX_employee_position_id" ON "employee" ("position_id")`);

        // Precarga el catálogo con los cargos existentes y enlaza a cada empleado.
        await queryRunner.query(`INSERT INTO "job_position" ("name") SELECT DISTINCT ON (LOWER(TRIM("position"))) TRIM("position") FROM "employee" WHERE "position" IS NOT NULL AND TRIM("position") <> '' ON CONFLICT DO NOTHING`);
        await queryRunner.query(`UPDATE "employee" e SET "position_id" = p."id" FROM "job_position" p WHERE LOWER(TRIM(e."position")) = LOWER(p."name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_employee_position_id"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_employee_job_position"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP COLUMN "position_id"`);
        await queryRunner.query(`DROP INDEX "UQ_job_position_name_lower"`);
        await queryRunner.query(`DROP TABLE "job_position"`);
    }
}

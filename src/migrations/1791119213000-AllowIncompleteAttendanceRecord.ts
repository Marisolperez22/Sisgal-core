import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * HU04 - Consultar historial de asistencia por empleado.
 *
 * Permite guardar registros sin hora de salida (registro incompleto, CA07) y
 * agrega los índices que usa la consulta paginada del historial por empleado
 * y por rango de fechas (CA11).
 */
export class AllowIncompleteAttendanceRecord1791119213000 implements MigrationInterface {
    name = 'AllowIncompleteAttendanceRecord1791119213000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance_record" ALTER COLUMN "check_out" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_attendance_record_employee_check_in" ON "attendance_record" ("employee_id", "check_in")`);
        await queryRunner.query(`CREATE INDEX "IDX_attendance_record_check_in" ON "attendance_record" ("check_in")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_attendance_record_check_in"`);
        await queryRunner.query(`DROP INDEX "IDX_attendance_record_employee_check_in"`);
        // Falla si quedan registros incompletos: deben cerrarse antes de revertir.
        await queryRunner.query(`ALTER TABLE "attendance_record" ALTER COLUMN "check_out" SET NOT NULL`);
    }
}

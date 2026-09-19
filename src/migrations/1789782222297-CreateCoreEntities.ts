import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoreEntities1789782222297 implements MigrationInterface {
    name = 'CreateCoreEntities1789782222297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "company" ("id" SERIAL NOT NULL, "name" character varying(40) NOT NULL, "nit" character varying(40) NOT NULL, "legal_rep" character varying(40) NOT NULL, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "branch_config" ("id" SERIAL NOT NULL, "config_key" character varying(40) NOT NULL, "config_value" character varying(40) NOT NULL, "branch_id" integer, CONSTRAINT "PK_54c43a1f8bf18614dfd4483977f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance_record" ("id" SERIAL NOT NULL, "check_in" TIMESTAMP WITH TIME ZONE NOT NULL, "check_out" TIMESTAMP WITH TIME ZONE NOT NULL, "work_minutes" integer NOT NULL, "extra_minutes" integer NOT NULL, "night_minutes" integer NOT NULL, "holiday_minutes" integer NOT NULL, "is_holiday" boolean NOT NULL, "employee_id" integer, "branch_id" integer, CONSTRAINT "PK_c23131acc63826e373019447965" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance_record_log" ("id" SERIAL NOT NULL, "attendance_record_id" integer, "attendance_log_id" integer, CONSTRAINT "PK_95b451d439186a8957585df5249" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance_log" ("id" SERIAL NOT NULL, "event_time" TIMESTAMP WITH TIME ZONE NOT NULL, "event_sign" character varying(40) NOT NULL, "idempotency_key" character varying(40) NOT NULL, "employee_id" integer, "device_id" integer, CONSTRAINT "PK_c5f15a2267f6b4a7174001ea912" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "biometric_device" ("id" SERIAL NOT NULL, "ip_address" character varying(40) NOT NULL, "port" integer NOT NULL, "serial_number" character varying(100) NOT NULL, "record_user" character varying(100) NOT NULL, "branch_id" integer, CONSTRAINT "PK_d4bb262779590ad90358d19d112" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "branch" ("id" SERIAL NOT NULL, "name" character varying(40) NOT NULL, "nit" character varying(40) NOT NULL, "is_active" boolean NOT NULL, "company_id" integer, CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_branch_assignment" ("id" SERIAL NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "is_current" boolean NOT NULL, "employee_id" integer, "branch_id" integer, CONSTRAINT "PK_f82799d5fe16d6f97f05ccd3a29" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payroll_line" ("id" SERIAL NOT NULL, "concept_name" character varying(40) NOT NULL, "type" character varying(40) NOT NULL, "amount" numeric(12,2) NOT NULL, "payroll_period_id" integer, CONSTRAINT "PK_771a5f3519b4d90da549b616428" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payroll_period" ("id" SERIAL NOT NULL, "period_start" date NOT NULL, "period_end" date NOT NULL, "total_earnings" numeric(12,2) NOT NULL, "total_deductions" numeric(12,2) NOT NULL, "net_pay" numeric(12,2) NOT NULL, "config_snapshot" json NOT NULL, "employee_id" integer, CONSTRAINT "PK_8a0c30dd9f1de6a0886a1cec58d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "disability_leave" ("id" SERIAL NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "total_days" integer NOT NULL, "employee_days" integer NOT NULL, "eps_days" integer NOT NULL, "employee_id" integer, CONSTRAINT "PK_f777f4d3c3632a189a1fc932223" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "system_config" ("key" character varying NOT NULL, "value" numeric(12,2) NOT NULL, "valid_from" date NOT NULL, "valid_to" date NOT NULL, CONSTRAINT "PK_eedd3cd0f227c7fb5eff2204e93" PRIMARY KEY ("key"))`);
        await queryRunner.query(`CREATE TABLE "work_rate_config" ("type" character varying NOT NULL, "multiplier" numeric(12,2) NOT NULL, "valid_from" date NOT NULL, "valid_to" date NOT NULL, CONSTRAINT "PK_f5c1551c605582725f09e488a15" PRIMARY KEY ("type"))`);
        await queryRunner.query(`CREATE TABLE "workday_config" ("id" SERIAL NOT NULL, "max_week_hours" integer NOT NULL, "max_day_hours" integer NOT NULL, "day_start" TIME NOT NULL, "day_end" TIME NOT NULL, "night_start" TIME NOT NULL, "night_end" TIME NOT NULL, "valid_from" date NOT NULL, "valid_to" date NOT NULL, CONSTRAINT "PK_c57245bd376acafdb5eecd22eb8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "branch_config" ADD CONSTRAINT "FK_3db9702e8f1c4b633788a29e935" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_record" ADD CONSTRAINT "FK_ea736900d347fc20bfb41cc8fa4" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_record" ADD CONSTRAINT "FK_389e1070c0dcfb2c1effc07c81c" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_record_log" ADD CONSTRAINT "FK_430a64336150aa193f310be6778" FOREIGN KEY ("attendance_record_id") REFERENCES "attendance_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_record_log" ADD CONSTRAINT "FK_d5ab012617f0d8cea468cc96186" FOREIGN KEY ("attendance_log_id") REFERENCES "attendance_log"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_log" ADD CONSTRAINT "FK_581de0440cf1e1193ef2f60cc8d" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance_log" ADD CONSTRAINT "FK_18a91a49458a6e815cb282ecbb9" FOREIGN KEY ("device_id") REFERENCES "biometric_device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "biometric_device" ADD CONSTRAINT "FK_f0c0184f33701b99d84225bcc18" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branch" ADD CONSTRAINT "FK_876085341242e41592b0e6b15e0" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_branch_assignment" ADD CONSTRAINT "FK_f5048ed6b4fce6dc56975dea3d7" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee_branch_assignment" ADD CONSTRAINT "FK_2df81837e622dfbd55f1af206c1" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payroll_line" ADD CONSTRAINT "FK_c7119ec7bfc69fabcbbe8385825" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_period"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payroll_period" ADD CONSTRAINT "FK_1d166f4866acb496c8e81b7375b" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "disability_leave" ADD CONSTRAINT "FK_922f086ab11f273d25d1d2789f3" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disability_leave" DROP CONSTRAINT "FK_922f086ab11f273d25d1d2789f3"`);
        await queryRunner.query(`ALTER TABLE "payroll_period" DROP CONSTRAINT "FK_1d166f4866acb496c8e81b7375b"`);
        await queryRunner.query(`ALTER TABLE "payroll_line" DROP CONSTRAINT "FK_c7119ec7bfc69fabcbbe8385825"`);
        await queryRunner.query(`ALTER TABLE "employee_branch_assignment" DROP CONSTRAINT "FK_2df81837e622dfbd55f1af206c1"`);
        await queryRunner.query(`ALTER TABLE "employee_branch_assignment" DROP CONSTRAINT "FK_f5048ed6b4fce6dc56975dea3d7"`);
        await queryRunner.query(`ALTER TABLE "branch" DROP CONSTRAINT "FK_876085341242e41592b0e6b15e0"`);
        await queryRunner.query(`ALTER TABLE "biometric_device" DROP CONSTRAINT "FK_f0c0184f33701b99d84225bcc18"`);
        await queryRunner.query(`ALTER TABLE "attendance_log" DROP CONSTRAINT "FK_18a91a49458a6e815cb282ecbb9"`);
        await queryRunner.query(`ALTER TABLE "attendance_log" DROP CONSTRAINT "FK_581de0440cf1e1193ef2f60cc8d"`);
        await queryRunner.query(`ALTER TABLE "attendance_record_log" DROP CONSTRAINT "FK_d5ab012617f0d8cea468cc96186"`);
        await queryRunner.query(`ALTER TABLE "attendance_record_log" DROP CONSTRAINT "FK_430a64336150aa193f310be6778"`);
        await queryRunner.query(`ALTER TABLE "attendance_record" DROP CONSTRAINT "FK_389e1070c0dcfb2c1effc07c81c"`);
        await queryRunner.query(`ALTER TABLE "attendance_record" DROP CONSTRAINT "FK_ea736900d347fc20bfb41cc8fa4"`);
        await queryRunner.query(`ALTER TABLE "branch_config" DROP CONSTRAINT "FK_3db9702e8f1c4b633788a29e935"`);
        await queryRunner.query(`DROP TABLE "workday_config"`);
        await queryRunner.query(`DROP TABLE "work_rate_config"`);
        await queryRunner.query(`DROP TABLE "system_config"`);
        await queryRunner.query(`DROP TABLE "disability_leave"`);
        await queryRunner.query(`DROP TABLE "payroll_period"`);
        await queryRunner.query(`DROP TABLE "payroll_line"`);
        await queryRunner.query(`DROP TABLE "employee_branch_assignment"`);
        await queryRunner.query(`DROP TABLE "branch"`);
        await queryRunner.query(`DROP TABLE "biometric_device"`);
        await queryRunner.query(`DROP TABLE "attendance_log"`);
        await queryRunner.query(`DROP TABLE "attendance_record_log"`);
        await queryRunner.query(`DROP TABLE "attendance_record"`);
        await queryRunner.query(`DROP TABLE "branch_config"`);
        await queryRunner.query(`DROP TABLE "company"`);
    }

}

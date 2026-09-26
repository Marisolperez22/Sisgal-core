import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../../entities/branch.model';
import { BranchService } from './application/services/branch.service';
import { BRANCH_REPOSITORY_PORT } from './domain/ports/branch.repository.port';
import { BranchController } from './infrastructure/http/controllers/branch.controller';
import { BranchTypeOrmRepository } from './infrastructure/persistence/repositories/branch.typeorm.repository';
import { Company } from 'src/entities/company.model';
import { COMPANY_REPOSITORY_PORT } from './domain/ports/company.repository.port';
import { CompanyTypeOrmRepository } from './infrastructure/persistence/repositories/company-typeorm.repository';
import { AttendanceRecord, EmployeeBranchAssignment } from 'src/entities';
import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';
import { WinstonAuditAdapter } from 'src/infraestructure/logging/winston/winston-audit.adapter';
import { AuthModule } from 'src/infraestructure/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Branch,
      Company,
      EmployeeBranchAssignment,
      AttendanceRecord,
    ]),
  ],
  controllers: [BranchController],
  providers: [
    BranchService,
    {
      provide: BRANCH_REPOSITORY_PORT,
      useClass: BranchTypeOrmRepository,
    },
    {
      provide: COMPANY_REPOSITORY_PORT,
      useClass: CompanyTypeOrmRepository,
    },
    {
      provide: AUDIT_PORT,
      useClass: WinstonAuditAdapter,
    },
  ],
  exports: [BranchService, BRANCH_REPOSITORY_PORT],
})
export class SucursalesModule {}

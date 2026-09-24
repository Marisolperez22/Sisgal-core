import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../../entities/branch.model';
import { BranchService } from './application/services/branch.service';
import { BRANCH_REPOSITORY_PORT } from './domain/ports/branch.repository.port';
import { BranchController } from './infrastructure/http/controllers/branch.controller';
import { BranchTypeOrmRepository } from './infrastructure/persistence/repositories/branch.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [BranchController],
  providers: [
    BranchService,
    {
      provide: BRANCH_REPOSITORY_PORT,
      useClass: BranchTypeOrmRepository,
    },
  ],
  exports: [BranchService, BRANCH_REPOSITORY_PORT],
})
export class SucursalesModule {}

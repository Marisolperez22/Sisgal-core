import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Branch } from '../../../../../entities/branch.model';
import { BranchRepositoryPort } from '../../../domain/ports/branch.repository.port';
import { AttendanceRecord, EmployeeBranchAssignment } from 'src/entities';

@Injectable()
export class BranchTypeOrmRepository implements BranchRepositoryPort {
  constructor(
    @InjectRepository(Branch)
    private readonly repository: Repository<Branch>,

    @InjectRepository(EmployeeBranchAssignment)
    private readonly employeeBranchAssignmentRepository: Repository<EmployeeBranchAssignment>,

    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepository: Repository<AttendanceRecord>,

    private readonly dataSource: DataSource,
  ) {}

  async findAll(soloActivas?: boolean): Promise<Branch[]> {
    const where: FindOptionsWhere<Branch> = {};

    if (soloActivas !== undefined) {
      where.is_active = soloActivas;
    }

    return this.repository.find({
      where,
      relations: { company: true },
      order: {
        name: 'ASC',
      },
    });
  }

  async findActivas(): Promise<Branch[]> {
    return this.findAll(true);
  }

  async findById(id: number): Promise<Branch | null> {
    return this.repository.findOne({
      where: { id },
      relations: { company: true },
    });
  }

  async findByName(name: string): Promise<Branch | null> {
    return this.repository.findOne({
      where: { name },
      relations: { company: true },
    });
  }

  async create(branch: Branch): Promise<Branch> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nuevaSucursal = queryRunner.manager.create(Branch, branch);

      const sucursalCreada = await queryRunner.manager.save(
        Branch,
        nuevaSucursal,
      );

      await queryRunner.commitTransaction();

      return sucursalCreada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(branch: Branch): Promise<Branch> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sucursalActualizada = await queryRunner.manager.save(
        Branch,
        branch,
      );

      await queryRunner.commitTransaction();

      return sucursalActualizada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deactivate(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Branch, { id }, { is_active: false });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async hasEmployees(id: number): Promise<boolean> {
    const count = await this.employeeBranchAssignmentRepository.count({
      where: {
        branch: {
          id,
        },
      },
    });

    return count > 0;
  }

  async hasHistoricalRecords(id: number): Promise<boolean> {
    const count = await this.attendanceRecordRepository.count({
      where: {
        branch: {
          id,
        },
      },
    });

    return count > 0;
  }
}

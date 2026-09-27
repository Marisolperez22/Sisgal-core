import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { Employee, Position } from 'src/entities';
import { PositionRepositoryPort } from '../../../domain/ports/position.repository.port';
import { NombreCargoDuplicadoError } from '../../../domain/errors/nombre-cargo-duplicado.error';

/** Código de PostgreSQL para violación de restricción única. */
const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class PositionTypeOrmRepository implements PositionRepositoryPort {
  constructor(
    @InjectRepository(Position)
    private readonly repository: Repository<Position>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    private readonly dataSource: DataSource,
  ) {}

  async findAll(soloActivos?: boolean): Promise<Position[]> {
    const where: FindOptionsWhere<Position> = {};

    if (soloActivos !== undefined) {
      where.is_active = soloActivos;
    }

    return this.repository.find({
      where,
      order: {
        name: 'ASC',
      },
    });
  }

  async findActivos(): Promise<Position[]> {
    return this.findAll(true);
  }

  async findById(id: number): Promise<Position | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Position | null> {
    return this.repository
      .createQueryBuilder('position')
      .where('LOWER(position.name) = LOWER(:name)', { name })
      .getOne();
  }

  async create(position: Position): Promise<Position> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nuevoCargo = queryRunner.manager.create(Position, position);

      const cargoCreado = await queryRunner.manager.save(Position, nuevoCargo);

      await queryRunner.commitTransaction();

      return cargoCreado;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw this.traducirError(error, position.name);
    } finally {
      await queryRunner.release();
    }
  }

  async update(position: Position): Promise<Position> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cargoActualizado = await queryRunner.manager.save(
        Position,
        position,
      );

      await queryRunner.commitTransaction();

      return cargoActualizado;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw this.traducirError(error, position.name);
    } finally {
      await queryRunner.release();
    }
  }

  async deactivate(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Position, { id }, { is_active: false });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async hasEmployees(id: number): Promise<boolean> {
    // Cuenta empleados actuales y retirados: ambos son información histórica.
    const count = await this.employeeRepository.count({
      where: {
        jobPosition: {
          id,
        },
      },
    });

    return count > 0;
  }

  private traducirError(error: unknown, nombre: string): unknown {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string } | undefined)?.code ===
        PG_UNIQUE_VIOLATION
    ) {
      return new NombreCargoDuplicadoError(nombre);
    }

    return error;
  }
}

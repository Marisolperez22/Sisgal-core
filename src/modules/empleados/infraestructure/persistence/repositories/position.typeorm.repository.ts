import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from 'src/entities/position.model';
import { PositionRepositoryPort } from 'src/modules/empleados/domain/ports/position.repository.port';

@Injectable()
export class PositionTypeOrmRepository implements PositionRepositoryPort {
  constructor(
    @InjectRepository(Position)
    private readonly repository: Repository<Position>,
  ) {}

  async findById(id: number): Promise<Position | null> {
    return this.repository.findOne({ where: { id } });
  }
}

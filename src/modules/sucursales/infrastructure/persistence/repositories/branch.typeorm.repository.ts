import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Branch } from '../../../../../entities/branch.model';
import { BranchRepositoryPort } from '../../../domain/ports/branch.repository.port';

@Injectable()
export class BranchTypeOrmRepository implements BranchRepositoryPort {
  constructor(
    @InjectRepository(Branch)
    private readonly repository: Repository<Branch>,
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

  async create(
    branch: Branch,
  ): Promise<Branch> {
    const nuevaSucursal =
      this.repository.create(branch);

    return this.repository.save(nuevaSucursal);
  }
}

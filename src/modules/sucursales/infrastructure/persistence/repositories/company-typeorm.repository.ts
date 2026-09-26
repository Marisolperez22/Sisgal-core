import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from '../../../../../entities/company.model';
import { CompanyRepositoryPort } from '../../../domain/ports/company.repository.port';

@Injectable()
export class CompanyTypeOrmRepository implements CompanyRepositoryPort {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.repository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findById(id: number): Promise<Company | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Company | null> {
    return this.repository.findOne({
      where: { name },
    });
  }
}
import { Company } from '../../../../entities/company.model';

export const COMPANY_REPOSITORY_PORT = Symbol('COMPANY_REPOSITORY_PORT');

export interface CompanyRepositoryPort {
  findAll(): Promise<Company[]>;
  findById(id: number): Promise<Company | null>;
  findByName(name: string): Promise<Company | null>;
}
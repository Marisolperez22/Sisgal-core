import { Branch } from '../../../../entities/branch.model';

export const BRANCH_REPOSITORY_PORT = Symbol('BRANCH_REPOSITORY_PORT');

export interface BranchRepositoryPort {
  findAll(soloActivas?: boolean): Promise<Branch[]>;
  findActivas(): Promise<Branch[]>;
  findById(id: number): Promise<Branch | null>;
  findByName(name: string): Promise<Branch | null>;

  create(branch: Branch): Promise<Branch>;
  update(branch: Branch): Promise<Branch>;

  deactivate(id: number): Promise<void>;
}

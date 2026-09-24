import { Branch } from '../../../../../entities/branch.model';

export class BranchResponseDto {
  id: number;
  name: string;
  nit: string;
  is_active: boolean;
  estado: 'ACTIVA' | 'INACTIVA';
  companyId: number | null;
  companyName: string | null;

  static fromEntity(entity: Branch): BranchResponseDto {
    const dto = new BranchResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.nit = entity.nit;
    dto.is_active = entity.is_active;
    dto.estado = entity.is_active ? 'ACTIVA' : 'INACTIVA';
    dto.companyId = entity.company ? entity.company.id : null;
    dto.companyName = entity.company ? entity.company.name : null;
    return dto;
  }
}

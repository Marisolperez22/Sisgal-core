import { ApiProperty } from '@nestjs/swagger';
import { Branch } from '../../../../../entities/branch.model';

export class BranchResponseDto {
  @ApiProperty({
    description: 'Identificador único de la sucursal',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Centro',
  })
  name!: string;

  @ApiProperty({
    description: 'Ciudad donde se encuentra ubicada la sucursal.',
    example: 'Medellín',
  })
  city!: string;

  @ApiProperty({
    description: 'Número telefónico de la sucursal.',
    example: '6041234567',
    nullable: true,
  })
  phone?: string | null;

  @ApiProperty({
    description: 'Dirección física de la sucursal.',
    example: 'Carrera 43A # 10-15',
    nullable: true,
  })
  address!: string | null;

  @ApiProperty({
    description: 'Indica si la sucursal se encuentra activa',
    example: true,
  })
  is_active!: boolean;

  @ApiProperty({
    description: 'Identificador de la empresa asociada',
    example: 1,
    nullable: true,
  })
  companyId!: number | null;

  @ApiProperty({
    description: 'Nombre de la empresa asociada',
    example: 'JS Burguer Parrilla',
    nullable: true,
  })
  companyName!: string | null;

  static fromEntity(entity: Branch): BranchResponseDto {
    const dto = new BranchResponseDto();

    dto.id = entity.id;
    dto.name = entity.name;
    dto.city = entity.city;
    dto.phone = entity.phone;
    dto.address = entity.address;
    dto.is_active = entity.is_active;

    dto.companyId = entity.company ? entity.company.id : null;
    dto.companyName = entity.company ? entity.company.name : null;

    return dto;
  }
}

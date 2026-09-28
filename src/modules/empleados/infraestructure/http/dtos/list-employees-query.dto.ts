import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListEmployeesQueryDto {
  @ApiPropertyOptional({
    description: 'Busca por nombre, apellido o número de documento',
    example: 'Pérez',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtra por el identificador de la sucursal',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  branchId?: number;

  @ApiPropertyOptional({
    description: 'Filtra por el identificador del cargo',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  positionId?: number;

  @ApiPropertyOptional({
    description: 'Filtra por el estado del empleado',
    example: 'ACTIVO',
    enum: ['ACTIVO', 'INACTIVO'],
  })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  status?: 'ACTIVO' | 'INACTIVO';
}

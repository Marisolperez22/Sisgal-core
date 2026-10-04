import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { DisabilityStatus } from '../../../domain/value-objects/disability-status';

export class ListDisabilityLeaveQueryDto {
  @ApiPropertyOptional({
    description: 'Filtra por el identificador del empleado',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  @ApiPropertyOptional({
    description: 'Filtra por nombre o parte del nombre del empleado',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiPropertyOptional({
    description: 'Filtra por el número de documento exacto del empleado',
    example: '1020304050',
  })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiPropertyOptional({
    description: 'Filtra por el identificador del cargo del empleado',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  positionId?: number;

  @ApiPropertyOptional({
    description: 'Filtra por el estado de la incapacidad',
    enum: ['Activo', 'Finalizado'],
    example: 'Activo',
  })
  @IsOptional()
  @IsIn(['Activo', 'Finalizado'])
  status?: DisabilityStatus;

  @ApiPropertyOptional({
    description: 'Filtra registros cuyo período incluya esta fecha o sea posterior a ella',
    example: '2026-09-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filtra registros cuyo período incluya esta fecha o sea anterior a ella',
    example: '2026-09-30',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

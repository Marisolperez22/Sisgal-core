import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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

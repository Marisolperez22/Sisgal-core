import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceRecordStatus } from '../../../domain/value-objects/attendance-record-status.enum';

/** Cantidades de resultados por página que admite el historial (CA09). */
export const RESULTADOS_POR_PAGINA = [10, 25, 50];

export class HistorialAsistenciaQueryDto {
  @ApiPropertyOptional({
    description: 'Identificador del empleado',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El identificador del empleado debe ser un número entero.',
  })
  @Min(1, { message: 'El identificador del empleado debe ser mayor que cero.' })
  empleadoId?: number;

  @ApiPropertyOptional({
    description:
      'Fecha inicial del rango (YYYY-MM-DD). No puede ser anterior al 1 de enero de 1900.',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString(
    { strict: true },
    { message: 'La fechaDesde debe ser una fecha válida.' },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fechaDesde debe tener formato YYYY-MM-DD.',
  })
  fechaDesde?: string;

  @ApiPropertyOptional({
    description:
      'Fecha final del rango (YYYY-MM-DD). No puede ser posterior a la fecha actual.',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsDateString(
    { strict: true },
    { message: 'La fechaHasta debe ser una fecha válida.' },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fechaHasta debe tener formato YYYY-MM-DD.',
  })
  fechaHasta?: string;

  @ApiPropertyOptional({
    description:
      'Estado del registro. Un registro sin hora de salida es INCOMPLETO.',
    enum: AttendanceRecordStatus,
    example: AttendanceRecordStatus.INCOMPLETO,
  })
  @IsOptional()
  @IsEnum(AttendanceRecordStatus, {
    message: 'El estado debe ser COMPLETO o INCOMPLETO.',
  })
  estado?: AttendanceRecordStatus;

  @ApiPropertyOptional({
    description: 'Número de página que se desea consultar.',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero.' })
  @Min(1, { message: 'La página debe ser mayor que cero.' })
  pagina?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página.',
    enum: RESULTADOS_POR_PAGINA,
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn(RESULTADOS_POR_PAGINA, {
    message: 'La cantidad de resultados por página debe ser 10, 25 o 50.',
  })
  porPagina?: number;
}

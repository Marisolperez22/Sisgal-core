import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';
import type { AuditPort } from 'src/application/ports/audit/audit.port';
import {
  fechaActual,
  inicioDelDia,
  inicioDelDiaSiguiente,
} from '../../domain/business-day';
import {
  ATTENDANCE_RECORD_REPOSITORY_PORT,
  type AttendanceRecordRepositoryPort,
} from '../../domain/ports/attendance-record.repository.port';
import {
  AttendanceHistoryResponseDto,
  HistorialAsistenciaQueryDto,
} from '../../infrastructure/http/dtos';

const FECHA_MINIMA = '1900-01-01';
const PAGINA_INICIAL = 1;
const RESULTADOS_POR_DEFECTO = 10;

@Injectable()
export class AttendanceHistoryService {
  constructor(
    @Inject(ATTENDANCE_RECORD_REPOSITORY_PORT)
    private readonly attendanceRecordRepository: AttendanceRecordRepositoryPort,

    @Inject(AUDIT_PORT)
    private readonly auditPort: AuditPort,
  ) {}

  async consultarHistorial(
    query: HistorialAsistenciaQueryDto,
  ): Promise<AttendanceHistoryResponseDto> {
    this.validarRangoFechas(query.fechaDesde, query.fechaHasta);

    const pagina = query.pagina ?? PAGINA_INICIAL;
    const porPagina = query.porPagina ?? RESULTADOS_POR_DEFECTO;

    const filtros = {
      empleadoId: query.empleadoId,
      fechaDesde: query.fechaDesde,
      fechaHasta: query.fechaHasta,
      estado: query.estado,
      pagina,
      porPagina,
    };

    try {
      const { records, total } =
        await this.attendanceRecordRepository.findHistory({
          empleadoId: query.empleadoId,
          desde: query.fechaDesde ? inicioDelDia(query.fechaDesde) : undefined,
          hasta: query.fechaHasta
            ? inicioDelDiaSiguiente(query.fechaHasta)
            : undefined,
          estado: query.estado,
          pagina,
          porPagina,
        });

      this.auditPort.log({
        action: 'ATTENDANCE_HISTORY_CONSULTED',
        module: 'Asistencia',
        resource: 'AttendanceRecord',
        result: 'SUCCESS',
        message: 'Se consultó el historial de asistencia.',
        metadata: {
          ...filtros,
          total,
        },
      });

      return AttendanceHistoryResponseDto.fromPage(
        records,
        total,
        pagina,
        porPagina,
      );
    } catch (error) {
      this.auditPort.log({
        action: 'ATTENDANCE_HISTORY_CONSULT_FAILED',
        module: 'Asistencia',
        resource: 'AttendanceRecord',
        result: 'FAILED',
        message: 'Falló la consulta del historial de asistencia.',
        metadata: {
          ...filtros,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  private validarRangoFechas(fechaDesde?: string, fechaHasta?: string): void {
    // Las fechas llegan como YYYY-MM-DD, por lo que se comparan como texto.
    if (fechaDesde && fechaDesde < FECHA_MINIMA) {
      throw new BadRequestException(
        'La fecha inicial no puede ser anterior al 1 de enero de 1900.',
      );
    }

    if (fechaHasta && fechaHasta > fechaActual()) {
      throw new BadRequestException(
        'La fecha final no puede ser posterior a la fecha actual.',
      );
    }

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      throw new BadRequestException(
        'El rango de fechas seleccionado no es válido: la fecha inicial no puede ser posterior a la fecha final.',
      );
    }
  }
}

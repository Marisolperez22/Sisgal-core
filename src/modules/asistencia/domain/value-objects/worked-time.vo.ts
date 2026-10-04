import { AttendanceRecordStatus } from './attendance-record-status.enum';

const MILISEGUNDOS_POR_MINUTO = 60_000;

/**
 * Tiempo trabajado de un registro de asistencia: la diferencia entre la hora
 * de salida y la de entrada. Un registro sin salida es incompleto y no tiene
 * horas trabajadas.
 */
export class WorkedTime {
  private constructor(
    private readonly status: AttendanceRecordStatus,
    private readonly minutes: number | null,
  ) {}

  static fromMarks(checkIn: Date, checkOut?: Date | null): WorkedTime {
    if (!checkOut) {
      return new WorkedTime(AttendanceRecordStatus.INCOMPLETO, null);
    }

    const diferencia = checkOut.getTime() - checkIn.getTime();

    // Una salida anterior a la entrada no genera tiempo trabajado.
    const minutos = Math.max(
      0,
      Math.floor(diferencia / MILISEGUNDOS_POR_MINUTO),
    );

    return new WorkedTime(AttendanceRecordStatus.COMPLETO, minutos);
  }

  getStatus(): AttendanceRecordStatus {
    return this.status;
  }

  getMinutes(): number | null {
    return this.minutes;
  }
}

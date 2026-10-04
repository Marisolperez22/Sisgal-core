import { AttendanceRecordStatus } from './attendance-record-status.enum';
import { WorkedTime } from './worked-time.vo';

describe('WorkedTime', () => {
  const entrada = new Date('2026-09-15T13:00:00.000Z');

  // CA06
  it('debe calcular la diferencia entre la salida y la entrada', () => {
    const tiempo = WorkedTime.fromMarks(
      entrada,
      new Date('2026-09-15T21:30:00.000Z'),
    );

    expect(tiempo.getStatus()).toBe(AttendanceRecordStatus.COMPLETO);
    expect(tiempo.getMinutes()).toBe(510);
  });

  it('debe calcular los turnos que terminan al día siguiente', () => {
    const tiempo = WorkedTime.fromMarks(
      new Date('2026-09-15T23:00:00.000Z'),
      new Date('2026-09-16T07:00:00.000Z'),
    );

    expect(tiempo.getMinutes()).toBe(480);
  });

  it('debe descartar los segundos que no completan un minuto', () => {
    const tiempo = WorkedTime.fromMarks(
      entrada,
      new Date('2026-09-15T13:10:59.999Z'),
    );

    expect(tiempo.getMinutes()).toBe(10);
  });

  // CA07
  it.each([[null], [undefined]])(
    'debe marcar como incompleto un registro con salida %s y no calcular las horas',
    (salida) => {
      const tiempo = WorkedTime.fromMarks(entrada, salida);

      expect(tiempo.getStatus()).toBe(AttendanceRecordStatus.INCOMPLETO);
      expect(tiempo.getMinutes()).toBeNull();
    },
  );

  it('no debe generar tiempo trabajado cuando la salida es anterior a la entrada', () => {
    const tiempo = WorkedTime.fromMarks(
      entrada,
      new Date('2026-09-15T12:00:00.000Z'),
    );

    expect(tiempo.getStatus()).toBe(AttendanceRecordStatus.COMPLETO);
    expect(tiempo.getMinutes()).toBe(0);
  });
});

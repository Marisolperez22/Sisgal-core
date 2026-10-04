import {
  fechaActual,
  inicioDelDia,
  inicioDelDiaSiguiente,
} from './business-day';

describe('Día de operación', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('fechaActual', () => {
    it('debe retornar la fecha de Colombia en formato YYYY-MM-DD', () => {
      jest.useFakeTimers({ now: new Date('2026-10-04T15:00:00.000Z') });

      expect(fechaActual()).toBe('2026-10-04');
    });

    it('debe conservar el día de Colombia cuando en UTC ya es el día siguiente', () => {
      // 11:59 p. m. del 4 de octubre en Colombia.
      jest.useFakeTimers({ now: new Date('2026-10-05T04:59:00.000Z') });

      expect(fechaActual()).toBe('2026-10-04');
    });

    it('debe cambiar de día a la medianoche de Colombia', () => {
      jest.useFakeTimers({ now: new Date('2026-10-05T05:00:00.000Z') });

      expect(fechaActual()).toBe('2026-10-05');
    });
  });

  describe('límites del día', () => {
    it('debe iniciar el día a la medianoche de Colombia', () => {
      expect(inicioDelDia('2026-10-04')).toEqual(
        new Date('2026-10-04T05:00:00.000Z'),
      );
    });

    it('debe terminar el día al comenzar el siguiente', () => {
      expect(inicioDelDiaSiguiente('2026-10-04')).toEqual(
        new Date('2026-10-05T05:00:00.000Z'),
      );
    });

    it('debe calcular el día siguiente al cambiar de mes', () => {
      expect(inicioDelDiaSiguiente('2026-09-30')).toEqual(
        new Date('2026-10-01T05:00:00.000Z'),
      );
    });
  });
});

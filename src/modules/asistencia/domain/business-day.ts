/** Zona horaria de operación del restaurante. Colombia no tiene horario de verano. */
const ZONA_HORARIA = 'America/Bogota';
const DESFASE_UTC = '-05:00';

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de operación. */
export function fechaActual(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
  }).format(new Date());
}

/** Instante en que comienza el día indicado (YYYY-MM-DD) en la zona de operación. */
export function inicioDelDia(fecha: string): Date {
  return new Date(`${fecha}T00:00:00${DESFASE_UTC}`);
}

/** Instante en que comienza el día siguiente: límite exclusivo del día indicado. */
export function inicioDelDiaSiguiente(fecha: string): Date {
  return new Date(inicioDelDia(fecha).getTime() + MILISEGUNDOS_POR_DIA);
}

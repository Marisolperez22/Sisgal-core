export type DisabilityStatus = 'Activo' | 'Finalizado';

// Una incapacidad está Activa mientras la fecha actual no supere su fecha de
// finalización; después de esa fecha pasa a Finalizada. No existe un tercer
// estado (por ejemplo, "programada") según lo definido en SISGAL.
export function calcularEstadoIncapacidad(endDate: Date): DisabilityStatus {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fin = new Date(endDate);
  fin.setHours(0, 0, 0, 0);

  return fin >= hoy ? 'Activo' : 'Finalizado';
}

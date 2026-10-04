/**
 * Estado de un empleado activo en el día actual: está presente si registró al
 * menos una entrada hoy y ausente si no ha registrado ninguna.
 */
export enum AttendanceTodayStatus {
  PRESENTE = 'PRESENTE',
  AUSENTE = 'AUSENTE',
}

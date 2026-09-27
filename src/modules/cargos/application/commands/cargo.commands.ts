/**
 * Datos de entrada de los casos de uso. Viven en la capa de aplicación para que
 * el servicio no dependa de los DTOs HTTP de infraestructura; los DTOs los
 * satisfacen estructuralmente.
 */
export interface CrearCargoCommand {
  readonly nombre: string;
  readonly descripcion?: string | null;
}

export interface ActualizarCargoCommand {
  readonly nombre?: string;
  readonly descripcion?: string | null;
}

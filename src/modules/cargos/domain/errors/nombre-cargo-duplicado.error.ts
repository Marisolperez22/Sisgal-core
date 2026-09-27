/**
 * Lo lanza el adaptador de persistencia cuando la base de datos rechaza un
 * nombre repetido. Cubre la condición de carrera entre la validación previa
 * del servicio y el INSERT/UPDATE, sin exponer detalles del motor.
 */
export class NombreCargoDuplicadoError extends Error {
  constructor(readonly nombre: string) {
    super(`Ya existe un cargo con el nombre "${nombre}".`);
    this.name = 'NombreCargoDuplicadoError';
  }
}

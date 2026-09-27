import { Position } from '../../../../entities/position.model';

export const POSITION_REPOSITORY_PORT = Symbol('POSITION_REPOSITORY_PORT');

export interface PositionRepositoryPort {
  findAll(soloActivos?: boolean): Promise<Position[]>;
  findActivos(): Promise<Position[]>;
  findById(id: number): Promise<Position | null>;
  /** Búsqueda sin distinguir mayúsculas ni minúsculas. */
  findByName(name: string): Promise<Position | null>;

  /** @throws NombreCargoDuplicadoError si el nombre ya existe. */
  create(position: Position): Promise<Position>;
  /** @throws NombreCargoDuplicadoError si el nombre ya existe. */
  update(position: Position): Promise<Position>;

  deactivate(id: number): Promise<void>;

  hasEmployees(id: number): Promise<boolean>;
}

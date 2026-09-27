import { Position } from 'src/entities/position.model';

export const POSITION_REPOSITORY_PORT = Symbol('POSITION_REPOSITORY_PORT');

export interface PositionRepositoryPort {
  findById(id: number): Promise<Position | null>;
}

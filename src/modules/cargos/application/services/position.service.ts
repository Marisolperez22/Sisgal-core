import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  POSITION_REPOSITORY_PORT,
  type PositionRepositoryPort,
} from '../../domain/ports/position.repository.port';
import { NombreCargoDuplicadoError } from '../../domain/errors/nombre-cargo-duplicado.error';
import {
  ActualizarCargoCommand,
  CrearCargoCommand,
} from '../commands/cargo.commands';
import { Position } from 'src/entities';
import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';
import type { AuditPort } from 'src/application/ports/audit/audit.port';

@Injectable()
export class PositionService {
  constructor(
    @Inject(POSITION_REPOSITORY_PORT)
    private readonly positionRepository: PositionRepositoryPort,

    @Inject(AUDIT_PORT)
    private readonly auditPort: AuditPort,
  ) {}

  obtenerTodos(soloActivos?: boolean): Promise<Position[]> {
    return this.positionRepository.findAll(soloActivos);
  }

  obtenerActivos(): Promise<Position[]> {
    return this.positionRepository.findActivos();
  }

  async obtenerPorId(id: number): Promise<Position> {
    const cargo = await this.positionRepository.findById(id);

    if (!cargo) {
      throw new NotFoundException(
        `No se encontró un cargo con el identificador ${id}.`,
      );
    }

    return cargo;
  }

  async crear(command: CrearCargoCommand): Promise<Position> {
    await this.validarNombreDuplicado(command.nombre);

    const cargo = new Position();

    cargo.name = command.nombre;
    cargo.description = this.normalizarDescripcion(command.descripcion);
    cargo.is_active = true;

    try {
      const cargoCreado = await this.positionRepository.create(cargo);

      this.auditPort.log({
        action: 'POSITION_CREATED',
        module: 'Cargos',
        resource: 'Position',
        resourceId: cargoCreado.id,
        result: 'SUCCESS',
        message: `Se creó el cargo "${cargoCreado.name}".`,
      });

      return cargoCreado;
    } catch (error) {
      this.auditPort.log({
        action: 'POSITION_CREATE_FAILED',
        module: 'Cargos',
        resource: 'Position',
        result: 'FAILED',
        message: `Falló la creación del cargo "${command.nombre}".`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw this.traducirError(error);
    }
  }

  async actualizar(
    id: number,
    command: ActualizarCargoCommand,
  ): Promise<Position> {
    const cargo = await this.obtenerPorId(id);
    const valoresAnteriores = this.obtenerValoresOriginales(cargo);

    try {
      if (
        command.nombre !== undefined &&
        command.nombre.toLowerCase() !== cargo.name.toLowerCase()
      ) {
        await this.validarNombreDuplicado(command.nombre, id);
      }

      this.actualizarCamposCargo(cargo, command);

      const cargoActualizado = await this.positionRepository.update(cargo);

      this.auditPort.log({
        action: 'POSITION_UPDATED',
        module: 'Cargos',
        resource: 'Position',
        resourceId: cargoActualizado.id,
        result: 'SUCCESS',
        message: `Se actualizó el cargo "${cargoActualizado.name}".`,
        metadata: {
          changes: this.construirCambios(valoresAnteriores, cargoActualizado),
        },
      });

      return cargoActualizado;
    } catch (error) {
      this.auditPort.log({
        action: 'POSITION_UPDATE_FAILED',
        module: 'Cargos',
        resource: 'Position',
        resourceId: id,
        result: 'FAILED',
        message: `Falló la actualización del cargo con identificador ${id}.`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw this.traducirError(error);
    }
  }

  async eliminar(id: number): Promise<void> {
    const cargo = await this.obtenerPorId(id);

    if (!cargo.is_active) {
      throw new ConflictException(
        `El cargo con el identificador ${id} ya se encuentra inactivo.`,
      );
    }

    const tieneEmpleados = await this.positionRepository.hasEmployees(id);

    if (tieneEmpleados) {
      throw new ConflictException(
        'No se puede desactivar el cargo porque tiene empleados o registros históricos asociados.',
      );
    }

    try {
      await this.positionRepository.deactivate(id);

      this.auditPort.log({
        action: 'POSITION_DEACTIVATED',
        module: 'Cargos',
        resource: 'Position',
        resourceId: id,
        result: 'SUCCESS',
        message: `Se inactivó el cargo "${cargo.name}".`,
      });
    } catch (error) {
      this.auditPort.log({
        action: 'POSITION_DEACTIVATE_FAILED',
        module: 'Cargos',
        resource: 'Position',
        resourceId: id,
        result: 'FAILED',
        message: `Falló la inactivación del cargo con identificador ${id}.`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  private async validarNombreDuplicado(
    nombre: string,
    idActual?: number,
  ): Promise<void> {
    const cargoExistente = await this.positionRepository.findByName(nombre);

    if (cargoExistente && cargoExistente.id !== idActual) {
      throw new ConflictException(
        `Ya existe un cargo con el nombre "${nombre}".`,
      );
    }
  }

  private actualizarCamposCargo(
    cargo: Position,
    command: ActualizarCargoCommand,
  ): void {
    if (command.nombre !== undefined) {
      cargo.name = command.nombre;
    }

    if (command.descripcion !== undefined) {
      cargo.description = this.normalizarDescripcion(command.descripcion);
    }
  }

  private normalizarDescripcion(descripcion?: string | null): string | null {
    return descripcion ? descripcion : null;
  }

  private obtenerValoresOriginales(cargo: Position) {
    return {
      nombre: cargo.name,
      descripcion: cargo.description ?? null,
    };
  }

  private construirCambios(
    valoresAnteriores: { nombre: string; descripcion: string | null },
    cargoActualizado: Position,
  ): Record<string, unknown> {
    const cambios: Record<string, unknown> = {};
    const valoresNuevos = this.obtenerValoresOriginales(cargoActualizado);

    for (const clave of ['nombre', 'descripcion'] as const) {
      if (valoresAnteriores[clave] !== valoresNuevos[clave]) {
        cambios[clave] = {
          anterior: valoresAnteriores[clave],
          nuevo: valoresNuevos[clave],
        };
      }
    }

    return cambios;
  }

  private traducirError(error: unknown): unknown {
    if (error instanceof NombreCargoDuplicadoError) {
      return new ConflictException(error.message);
    }

    return error;
  }
}

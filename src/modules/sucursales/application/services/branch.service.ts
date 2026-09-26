import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BRANCH_REPOSITORY_PORT,
  type BranchRepositoryPort,
} from '../../domain/ports/branch.repository.port';
import { BranchResponseDto } from '../../infrastructure/http/dtos/branch-response.dto';
import {
  ActualizarSucursalDto,
  CrearSucursalDto,
} from '../../infrastructure/http/dtos';
import { Branch } from 'src/entities';

import {
  COMPANY_REPOSITORY_PORT,
  type CompanyRepositoryPort,
} from '../../domain/ports/company.repository.port';
import { AUDIT_PORT } from 'src/application/ports/audit/audit.port';
import type { AuditPort } from 'src/application/ports/audit/audit.port';

@Injectable()
export class BranchService {
  constructor(
    @Inject(BRANCH_REPOSITORY_PORT)
    private readonly branchRepository: BranchRepositoryPort,

    @Inject(COMPANY_REPOSITORY_PORT)
    private readonly companyRepository: CompanyRepositoryPort,

    @Inject(AUDIT_PORT)
    private readonly auditPort: AuditPort,
  ) {}

  async obtenerTodas(soloActivas?: boolean): Promise<BranchResponseDto[]> {
    const sucursales = await this.branchRepository.findAll(soloActivas);
    return sucursales.map((sucursal) => BranchResponseDto.fromEntity(sucursal));
  }

  async obtenerActivas(): Promise<BranchResponseDto[]> {
    const sucursales = await this.branchRepository.findActivas();
    return sucursales.map((sucursal) => BranchResponseDto.fromEntity(sucursal));
  }

  async obtenerPorId(id: number): Promise<BranchResponseDto> {
    const sucursal = await this.branchRepository.findById(id);

    if (!sucursal) {
      throw new NotFoundException(
        `No se encontró una sucursal con el identificador ${id}.`,
      );
    }

    return BranchResponseDto.fromEntity(sucursal);
  }

  async crear(dto: CrearSucursalDto): Promise<BranchResponseDto> {
    const company = await this.companyRepository.findById(dto.companyId);

    if (!company) {
      throw new NotFoundException(
        `No se encontró una empresa con el identificador ${dto.companyId}.`,
      );
    }

    const sucursalExistente = await this.branchRepository.findByName(
      dto.nombre,
    );

    if (sucursalExistente) {
      throw new ConflictException(
        `Ya existe una sucursal con el nombre "${dto.nombre}".`,
      );
    }

    const sucursal = new Branch();

    sucursal.name = dto.nombre;
    sucursal.city = dto.ciudad;
    sucursal.phone = dto.telefono ?? null;
    sucursal.address = dto.direccion;
    sucursal.is_active = true;
    sucursal.company = company;

    try {
      const sucursalCreada = await this.branchRepository.create(sucursal);

      this.auditPort.log({
        action: 'BRANCH_CREATED',
        module: 'Sucursales',
        resource: 'Branch',
        resourceId: sucursalCreada.id,
        result: 'SUCCESS',
        message: `Se creó la sucursal "${sucursalCreada.name}".`,
        metadata: {
          companyId: company.id,
          city: sucursalCreada.city,
        },
      });

      return BranchResponseDto.fromEntity(sucursalCreada);
    } catch (error) {
      this.auditPort.log({
        action: 'BRANCH_CREATE_FAILED',
        module: 'Sucursales',
        resource: 'Branch',
        result: 'FAILED',
        message: `Falló la creación de la sucursal "${dto.nombre}".`,
        metadata: {
          companyId: dto.companyId,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  async actualizar(
    id: number,
    dto: ActualizarSucursalDto,
  ): Promise<BranchResponseDto> {
    const sucursal = await this.branchRepository.findById(id);

    if (!sucursal) {
      throw new NotFoundException(
        `No se encontró una sucursal con el identificador ${id}.`,
      );
    }

    const valoresAnteriores = this.obtenerValoresOriginales(sucursal);

    try {
      await this.validarNombreDuplicado(id, dto.nombre, sucursal.name);
      this.actualizarCamposSucursal(sucursal, dto);

      const sucursalActualizada = await this.branchRepository.update(sucursal);
      const cambios = this.construirCambios(valoresAnteriores, sucursalActualizada);

      this.auditPort.log({
        action: 'BRANCH_UPDATED',
        module: 'Sucursales',
        resource: 'Branch',
        resourceId: sucursalActualizada.id,
        result: 'SUCCESS',
        message: `Se actualizó la sucursal "${sucursalActualizada.name}".`,
        metadata: {
          changes: cambios,
        },
      });

      return BranchResponseDto.fromEntity(sucursalActualizada);
    } catch (error) {
      this.auditPort.log({
        action: 'BRANCH_UPDATE_FAILED',
        module: 'Sucursales',
        resource: 'Branch',
        resourceId: id,
        result: 'FAILED',
        message: `Falló la actualización de la sucursal con identificador ${id}.`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  private obtenerValoresOriginales(sucursal: any) {
    return {
      nombre: sucursal.name,
      ciudad: sucursal.city,
      telefono: sucursal.phone,
      direccion: sucursal.address,
    };
  }

  private async validarNombreDuplicado(
    id: number,
    nombre: string | undefined,
    nombreActual: string,
  ): Promise<void> {
    if (nombre === undefined || nombre === nombreActual) {
      return;
    }

    const sucursalExistente = await this.branchRepository.findByName(nombre);

    if (sucursalExistente && sucursalExistente.id !== id) {
      throw new ConflictException(
        `Ya existe una sucursal con el nombre "${nombre}".`,
      );
    }
  }

  private actualizarCamposSucursal(
    sucursal: any,
    dto: ActualizarSucursalDto,
  ): void {
    if (dto.nombre !== undefined && dto.nombre !== sucursal.name) {
      sucursal.name = dto.nombre;
    }

    if (dto.direccion !== undefined) {
      sucursal.address = dto.direccion;
    }

    if (dto.telefono !== undefined) {
      sucursal.phone = dto.telefono;
    }

    if (dto.ciudad !== undefined) {
      sucursal.city = dto.ciudad;
    }
  }

  private construirCambios(
    valoresAnteriores: Record<string, any>,
    sucursalActualizada: any,
  ): Record<string, unknown> {
    const cambios: Record<string, unknown> = {};

    const campos = [
      ['nombre', 'name'],
      ['ciudad', 'city'],
      ['telefono', 'phone'],
      ['direccion', 'address'],
    ] as const;

    for (const [clave, propiedad] of campos) {
      if (valoresAnteriores[clave] !== sucursalActualizada[propiedad]) {
        cambios[clave] = {
          anterior: valoresAnteriores[clave],
          nuevo: sucursalActualizada[propiedad],
        };
      }
    }

    return cambios;
  }

  async eliminar(id: number): Promise<void> {
    const sucursal = await this.branchRepository.findById(id);

    if (!sucursal) {
      throw new NotFoundException(
        `No se encontró una sucursal con el identificador ${id}.`,
      );
    }

    if (!sucursal.is_active) {
      throw new ConflictException(
        `La sucursal con el identificador ${id} ya se encuentra inactiva.`,
      );
    }

    const tieneEmpleados = await this.branchRepository.hasEmployees(id);

    if (tieneEmpleados) {
      throw new ConflictException(
        'No se puede desactivar la sucursal porque tiene empleados asociados.',
      );
    }

    const tieneRegistrosHistoricos =
      await this.branchRepository.hasHistoricalRecords(id);

    if (tieneRegistrosHistoricos) {
      throw new ConflictException(
        'No se puede desactivar la sucursal porque tiene registros asociados.',
      );
    }

    try {
      await this.branchRepository.deactivate(id);

      this.auditPort.log({
        action: 'BRANCH_DEACTIVATED',
        module: 'Sucursales',
        resource: 'Branch',
        resourceId: id,
        result: 'SUCCESS',
        message: `Se inactivó la sucursal con identificador ${id}.`,
      });
    } catch (error) {
      this.auditPort.log({
        action: 'BRANCH_DEACTIVATE_FAILED',
        module: 'Sucursales',
        resource: 'Branch',
        resourceId: id,
        result: 'FAILED',
        message: `Falló la inactivación de la sucursal con identificador ${id}.`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }
}

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

@Injectable()
export class BranchService {
  constructor(
    @Inject(BRANCH_REPOSITORY_PORT)
    private readonly branchRepository: BranchRepositoryPort,
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

    // Estos campos dependerán del modelo definitivo de la BD.
    sucursal.is_active = true;

    const sucursalCreada = await this.branchRepository.create(sucursal);

    return BranchResponseDto.fromEntity(sucursalCreada);
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

    if (dto.nombre !== undefined && dto.nombre !== sucursal.name) {
      const sucursalExistente = await this.branchRepository.findByName(
        dto.nombre,
      );

      if (sucursalExistente && sucursalExistente.id !== id) {
        throw new ConflictException(
          `Ya existe una sucursal con el nombre "${dto.nombre}".`,
        );
      }

      sucursal.name = dto.nombre;
    }

    // Estos campos se mapearán cuando corrijamos
    // la entidad de base de datos.
    //
    // if (dto.direccion !== undefined) {
    //   sucursal.direccion = dto.direccion;
    // }
    //
    // if (dto.telefono !== undefined) {
    //   sucursal.telefono = dto.telefono;
    // }
    //
    // if (dto.ciudad !== undefined) {
    //   sucursal.ciudad = dto.ciudad;
    // }

    const sucursalActualizada = await this.branchRepository.update(sucursal);

    return BranchResponseDto.fromEntity(sucursalActualizada);
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

    await this.branchRepository.deactivate(id);
  }
}

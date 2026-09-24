import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  BRANCH_REPOSITORY_PORT,
  type BranchRepositoryPort,
} from '../../domain/ports/branch.repository.port';
import { BranchResponseDto } from '../../infrastructure/http/dtos/branch-response.dto';

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
}

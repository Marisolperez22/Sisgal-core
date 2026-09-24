import { Controller, Get, Query } from '@nestjs/common';
import { BranchService } from '../../../application/services/branch.service';
import { BranchResponseDto } from '../dtos/branch-response.dto';

@Controller(['sucursales', 'branches'])
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  async obtenerTodas(
    @Query('activas') activas?: string,
  ): Promise<BranchResponseDto[]> {
    const soloActivas =
      activas === 'true' ? true : activas === 'false' ? false : undefined;

    return this.branchService.obtenerTodas(soloActivas);
  }
}

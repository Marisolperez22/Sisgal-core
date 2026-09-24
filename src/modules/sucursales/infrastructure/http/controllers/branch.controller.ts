import { Controller, Get, Query } from '@nestjs/common';
import { BranchService } from '../../../application/services/branch.service';
import { BranchResponseDto } from '../dtos/branch-response.dto';

import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

type BranchServiceLike = {
  obtenerActivas: () => Promise<BranchResponseDto[]>;
  obtenerTodas: (soloActivas?: boolean) => Promise<BranchResponseDto[]>;
};

@ApiTags('Sucursales')
@Controller(['sucursales'])
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get('activas')
  @ApiOperation({
    summary: 'Obtener sucursales activas',
    description:
      'Obtiene todas las sucursales que se encuentran activas en el sistema.',
  })
  @ApiOkResponse({
    description: 'Sucursales activas obtenidas correctamente.',
    type: BranchResponseDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar las sucursales.',
  })
  obtenerActivas(): Promise<BranchResponseDto[]> {
    const branchService = this.branchService as unknown as BranchServiceLike;

    return branchService.obtenerActivas();
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener sucursales',
    description:
      'Obtiene las sucursales registradas. Permite filtrar los resultados según su estado de activación mediante el parámetro "activas".',
  })
  @ApiQuery({
    name: 'activas',
    required: false,
    type: Boolean,
    description:
      'Indica si se deben consultar únicamente las sucursales activas. Si no se proporciona, se retornan todas las sucursales.',
    example: true,
  })
  @ApiOkResponse({
    description: 'Sucursales obtenidas correctamente.',
    type: BranchResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'El valor proporcionado para el parámetro "activas" no es válido.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar las sucursales.',
  })
  async obtenerTodas(
    @Query('activas') activas?: string,
  ): Promise<BranchResponseDto[]> {
    let soloActivas: boolean | undefined = undefined;

    if (activas === 'true') soloActivas = true;
    else if (activas === 'false') soloActivas = false;

    const branchService = this.branchService as unknown as BranchServiceLike;

    return branchService.obtenerTodas(soloActivas);
  }
}

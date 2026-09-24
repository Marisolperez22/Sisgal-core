import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { BranchService } from '../../../application/services/branch.service';
import { BranchResponseDto } from '../dtos/branch-response.dto';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CrearSucursalDto } from '../dtos';

type BranchServiceLike = {
  obtenerActivas: () => Promise<BranchResponseDto[]>;
  obtenerTodas: (soloActivas?: boolean) => Promise<BranchResponseDto[]>;
  obtenerPorId: (id: number) => Promise<BranchResponseDto>;
  crear: (dto: CrearSucursalDto) => Promise<BranchResponseDto>;
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

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener sucursal por ID',
    description:
      'Obtiene la información detallada de una sucursal mediante su identificador único.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único de la sucursal.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Sucursal obtenida correctamente.',
    type: BranchResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'El identificador proporcionado no tiene un formato válido.',
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró una sucursal con el identificador proporcionado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar la sucursal.',
  })
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BranchResponseDto> {
    const branchService = this.branchService as unknown as BranchServiceLike;

    return branchService.obtenerPorId(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear sucursal',
    description:
      'Crea una nueva sucursal en el sistema utilizando la información proporcionada.',
  })
  @ApiCreatedResponse({
    description: 'Sucursal creada correctamente.',
    type: BranchResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Los datos proporcionados no cumplen con las reglas de validación.',
  })
  @ApiConflictResponse({
    description: 'Ya existe una sucursal con el mismo nombre.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al crear la sucursal.',
  })
  async crear(@Body() dto: CrearSucursalDto): Promise<BranchResponseDto> {
    const branchService = this.branchService as unknown as BranchServiceLike;

    return branchService.crear(dto);
  }
}

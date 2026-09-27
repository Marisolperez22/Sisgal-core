import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PositionService } from '../../../application/services/position.service';
import {
  ActualizarCargoDto,
  CrearCargoDto,
  PositionResponseDto,
} from '../dtos';
import { ErrorResponseDto } from 'src/shared/infraestructure/http/dtos';
import { JwtAuthGuard } from 'src/infraestructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infraestructure/auth/guards/roles.guard';
import { Roles } from 'src/infraestructure/auth/decorators/roles.decorator';
import { Role } from 'src/application/ports/auth/auth-user';

@ApiTags('Cargos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'No se proporcionó un token válido.',
  type: ErrorResponseDto,
})
@ApiForbiddenResponse({
  description: 'El usuario no tiene permisos para realizar esta operación.',
  type: ErrorResponseDto,
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('cargos')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get('activos')
  @ApiOperation({
    summary: 'Obtener cargos activos',
    description:
      'Obtiene los cargos activos, disponibles para seleccionarse en los formularios del sistema.',
  })
  @ApiOkResponse({
    description: 'Cargos activos obtenidos correctamente.',
    type: PositionResponseDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar los cargos.',
    type: ErrorResponseDto,
  })
  async obtenerActivos(): Promise<PositionResponseDto[]> {
    const cargos = await this.positionService.obtenerActivos();

    return cargos.map((cargo) => PositionResponseDto.fromEntity(cargo));
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener cargos',
    description:
      'Obtiene los cargos registrados. Permite filtrar los resultados según su estado mediante el parámetro "activos".',
  })
  @ApiQuery({
    name: 'activos',
    required: false,
    type: Boolean,
    description:
      'Indica si se deben consultar únicamente los cargos activos (true) o inactivos (false). Si no se proporciona, se retornan todos.',
    example: true,
  })
  @ApiOkResponse({
    description: 'Cargos obtenidos correctamente.',
    type: PositionResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'El valor proporcionado para el parámetro "activos" no es válido.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar los cargos.',
    type: ErrorResponseDto,
  })
  async obtenerTodos(
    @Query('activos') activos?: string,
  ): Promise<PositionResponseDto[]> {
    let soloActivos: boolean | undefined;

    if (activos === undefined) {
      soloActivos = undefined;
    } else if (activos === 'true') {
      soloActivos = true;
    } else if (activos === 'false') {
      soloActivos = false;
    } else {
      throw new BadRequestException(
        'El parámetro "activos" debe ser "true" o "false".',
      );
    }

    const cargos = await this.positionService.obtenerTodos(soloActivos);

    return cargos.map((cargo) => PositionResponseDto.fromEntity(cargo));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener cargo por ID',
    description:
      'Obtiene la información de un cargo mediante su identificador único.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del cargo.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Cargo obtenido correctamente.',
    type: PositionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'El identificador proporcionado no tiene un formato válido.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un cargo con el identificador proporcionado.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar el cargo.',
    type: ErrorResponseDto,
  })
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PositionResponseDto> {
    const cargo = await this.positionService.obtenerPorId(id);

    return PositionResponseDto.fromEntity(cargo);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear cargo',
    description: 'Registra un nuevo cargo en el catálogo. Se crea activo.',
  })
  @ApiCreatedResponse({
    description: 'Cargo creado correctamente.',
    type: PositionResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Los datos proporcionados no cumplen con las reglas de validación.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe un cargo con el mismo nombre.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al crear el cargo.',
    type: ErrorResponseDto,
  })
  async crear(@Body() dto: CrearCargoDto): Promise<PositionResponseDto> {
    const cargo = await this.positionService.crear(dto);

    return PositionResponseDto.fromEntity(cargo);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar cargo',
    description:
      'Actualiza la información de un cargo existente. Solo se modifican los campos enviados; los registros históricos de empleados no se alteran.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del cargo que se desea actualizar.',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Cargo actualizado correctamente.',
    type: PositionResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'El identificador o los datos proporcionados no tienen un formato válido.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un cargo con el identificador proporcionado.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Ya existe otro cargo con el nombre proporcionado.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al actualizar el cargo.',
    type: ErrorResponseDto,
  })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCargoDto,
  ): Promise<PositionResponseDto> {
    const cargo = await this.positionService.actualizar(id, dto);

    return PositionResponseDto.fromEntity(cargo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Inactivar cargo',
    description:
      'Inactiva un cargo de forma lógica para conservar la trazabilidad. No se permite si el cargo tiene empleados o registros históricos asociados.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador único del cargo que se desea inactivar.',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Cargo inactivado correctamente.',
  })
  @ApiBadRequestResponse({
    description: 'El identificador proporcionado no tiene un formato válido.',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No se encontró un cargo con el identificador proporcionado.',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description:
      'No se puede inactivar el cargo porque ya está inactivo o tiene empleados o registros históricos asociados.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al inactivar el cargo.',
    type: ErrorResponseDto,
  })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.positionService.eliminar(id);
  }
}

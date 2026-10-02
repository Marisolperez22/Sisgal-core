import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'src/application/ports/auth/auth-user';
import { Roles } from 'src/infraestructure/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/infraestructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infraestructure/auth/guards/roles.guard';
import { LoanService } from '../../../application/services/loan.service';
import { LoanIndicatorsResponseDto } from '../dtos/loan-indicators-response.dto';
import { LoanQueryDto } from '../dtos/loan-query.dto';
import { LoanResponseDto } from '../dtos/loan-response.dto';

@ApiTags('Préstamos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMINISTRADOR)
@Controller('prestamos')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get('indicadores')
  @ApiOperation({
    summary: 'Obtener indicadores de préstamos activos',
    description:
      'Retorna en una consulta la cantidad y la suma del monto original de los préstamos activos.',
  })
  @ApiOkResponse({
    description: 'Indicadores de préstamos activos obtenidos correctamente.',
    type: LoanIndicatorsResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar los indicadores.',
  })
  obtenerIndicadores(): Promise<LoanIndicatorsResponseDto> {
    return this.loanService.obtenerIndicadores();
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener préstamos',
    description:
      'Lista los préstamos con la información del empleado y permite combinar filtros por empleado, nombre, documento, estado y fecha de otorgamiento.',
  })
  @ApiOkResponse({
    description: 'Préstamos obtenidos correctamente.',
    type: LoanResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'Los filtros o el rango de fechas proporcionados no son válidos.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar los préstamos.',
  })
  obtenerTodos(@Query() query: LoanQueryDto): Promise<LoanResponseDto[]> {
    return this.loanService.obtenerTodos(query);
  }
}

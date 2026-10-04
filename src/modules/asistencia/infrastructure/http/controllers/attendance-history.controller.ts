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
import { ErrorResponseDto } from 'src/shared/infraestructure/http/dtos';
import { AttendanceHistoryService } from '../../../application/services/attendance-history.service';
import {
  AttendanceHistoryResponseDto,
  HistorialAsistenciaQueryDto,
} from '../dtos';

@ApiTags('Asistencia')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMINISTRADOR)
@Controller('asistencias')
export class AttendanceHistoryController {
  constructor(
    private readonly attendanceHistoryService: AttendanceHistoryService,
  ) {}

  @Get('historial')
  @ApiOperation({
    summary: 'Consultar historial de asistencia',
    description:
      'Obtiene las marcaciones de asistencia en orden cronológico y de forma paginada. Permite combinar los filtros por empleado, rango de fechas y estado del registro. Es una consulta de solo lectura.',
  })
  @ApiOkResponse({
    description: 'Historial de asistencia obtenido correctamente.',
    type: AttendanceHistoryResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Los filtros, el rango de fechas o los parámetros de paginación no son válidos.',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar el historial.',
    type: ErrorResponseDto,
  })
  consultarHistorial(
    @Query() query: HistorialAsistenciaQueryDto,
  ): Promise<AttendanceHistoryResponseDto> {
    return this.attendanceHistoryService.consultarHistorial(query);
  }
}

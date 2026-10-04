import { Controller, Get, UseGuards } from '@nestjs/common';
import {
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
import { AttendanceTodayService } from '../../../application/services/attendance-today.service';
import { AttendanceTodayResponseDto } from '../dtos';

@ApiTags('Asistencia')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMINISTRADOR)
@Controller('asistencias')
export class AttendanceTodayController {
  constructor(
    private readonly attendanceTodayService: AttendanceTodayService,
  ) {}

  @Get('hoy')
  @ApiOperation({
    summary: 'Consultar la asistencia del día',
    description:
      'Obtiene los empleados activos con su estado de asistencia en el día actual: presente, con la hora de su primera entrada, o ausente. Incluye la cantidad de presentes y la fecha y hora de la consulta. Es una consulta de solo lectura.',
  })
  @ApiOkResponse({
    description: 'Asistencia del día obtenida correctamente.',
    type: AttendanceTodayResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al consultar la asistencia.',
    type: ErrorResponseDto,
  })
  consultarAsistenciaHoy(): Promise<AttendanceTodayResponseDto> {
    return this.attendanceTodayService.consultarAsistenciaHoy();
  }
}

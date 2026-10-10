import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'src/application/ports/auth/auth-user';
import { JwtAuthGuard } from 'src/infraestructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infraestructure/auth/guards/roles.guard';
import { Roles } from 'src/infraestructure/auth/decorators/roles.decorator';
import { PayrollHoursService } from '../../../application/services/payroll-hours.service';
import { ClassifyWorkedIntervalDto } from '../dtos/classify-worked-interval.dto';
import { ClassifiedHourResponseDto } from '../dtos/classified-hour-response.dto';

@ApiTags('Horario de nómina')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMINISTRADOR)
@Controller('payroll-hours')
export class PayrollHoursController {
  constructor(private readonly payrollHoursService: PayrollHoursService) {}

  @Post('classify')
  @ApiOperation({
    summary: 'Clasifica un intervalo de trabajo en horas diurnas y nocturnas',
    description:
      'Divide el intervalo según la configuración vigente y aplica el multiplicador vigente a cada segmento.',
  })
  @ApiCreatedResponse({
    description: 'Intervalo clasificado correctamente.',
    type: ClassifiedHourResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'El intervalo o la configuración de jornada no son válidos.',
  })
  @ApiNotFoundResponse({
    description: 'No existe configuración de jornada o multiplicador vigente.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Se produjo un error interno al clasificar el intervalo.',
  })
  async classify(
    @Body() dto: ClassifyWorkedIntervalDto,
  ): Promise<ClassifiedHourResponseDto[]> {
    return this.payrollHoursService.classifyWorkedInterval(
      dto.employeeId,
      dto.start,
      dto.end,
    );
  }
}

import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/shared/infraestructure/http/dtos';
import { DisabilityLeaveService } from 'src/modules/incapacidades/application/services/disability-leave.service';
import { RegisterDisabilityLeaveDto } from '../dtos/register-disability-leave.dto';
import { ListDisabilityLeaveQueryDto } from '../dtos/list-disability-leave-query.dto';
import { DisabilityLeaveResponseDto } from '../dtos/disability-leave-response.dto';
import { DisabilityLeaveIndicatorsResponseDto } from '../dtos/disability-leave-indicators-response.dto';
import { Roles } from '../../../../../infraestructure/auth/decorators/roles.decorator';
import { Role } from '../../../../../application/ports/auth/auth-user';
import type { AuthUser } from '../../../../../application/ports/auth/auth-user';
import { JwtAuthGuard } from '../../../../../infraestructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../infraestructure/auth/guards/roles.guard';

// Todos los endpoints exigen JWT de Supabase válido (JwtAuthGuard) y rol administrador (RolesGuard)
@ApiTags('Incapacidades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('incapacidades')
export class DisabilityLeaveController {
    constructor(private readonly disabilityLeaveService: DisabilityLeaveService) {}

    @Post()
    @ApiOperation({
        summary: 'Registrar incapacidad o licencia',
        description:
            'Registra una incapacidad o licencia para un empleado activo. Calcula automáticamente la cantidad de días y valida que el período no se cruce con uno ya existente.',
    })
    @ApiCreatedResponse({
        description: 'Incapacidad registrada correctamente.',
        type: DisabilityLeaveResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos, empleado inactivo o rango de fechas inválido.',
        type: ErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'No se encontró el empleado indicado.',
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'El período se cruza con un registro existente del empleado.',
        type: ErrorResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: 'Se produjo un error interno al registrar la incapacidad.',
        type: ErrorResponseDto,
    })
    async register(
        @Body() dto: RegisterDisabilityLeaveDto,
        @Req() request: Request & { user: AuthUser },
    ): Promise<DisabilityLeaveResponseDto> {
        const disabilityLeave = await this.disabilityLeaveService.register(dto, request.user);
        return DisabilityLeaveResponseDto.fromEntity(disabilityLeave);
    }

    @Get('indicadores')
    @ApiOperation({
        summary: 'Obtener indicadores de incapacidades activas',
        description:
            'Retorna en una sola consulta la cantidad y el total de días de las incapacidades que actualmente están en estado Activo.',
    })
    @ApiOkResponse({
        description: 'Indicadores obtenidos correctamente.',
        type: DisabilityLeaveIndicatorsResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: 'Se produjo un error interno al consultar los indicadores.',
        type: ErrorResponseDto,
    })
    async getIndicators(): Promise<DisabilityLeaveIndicatorsResponseDto> {
        const indicators = await this.disabilityLeaveService.getIndicators();
        const response = new DisabilityLeaveIndicatorsResponseDto();
        response.activeCount = indicators.activeCount;
        response.totalActiveDays = indicators.totalActiveDays;
        return response;
    }

    @Get()
    @ApiOperation({
        summary: 'Listar incapacidades',
        description:
            'Lista las incapacidades y licencias registradas, con filtros opcionales por empleado, nombre, cargo, estado y rango de fechas.',
    })
    @ApiOkResponse({
        description: 'Incapacidades obtenidas correctamente.',
        type: DisabilityLeaveResponseDto,
        isArray: true,
    })
    @ApiBadRequestResponse({
        description: 'El rango de fechas no es válido (fecha inicial posterior a la final).',
        type: ErrorResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: 'Se produjo un error interno al consultar las incapacidades.',
        type: ErrorResponseDto,
    })
    async findAll(
        @Query() query: ListDisabilityLeaveQueryDto,
    ): Promise<DisabilityLeaveResponseDto[]> {
        const disabilityLeaves = await this.disabilityLeaveService.findAll(query);
        return disabilityLeaves.map((disabilityLeave) =>
            DisabilityLeaveResponseDto.fromEntity(disabilityLeave),
        );
    }
}

import { BadRequestException, Body, ConflictException, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
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
import { EmployeeService } from 'src/modules/empleados/application/services/employee.service';
import { RegisterEmployeeDto } from '../dtos/register-employee.dto';
import { ListEmployeesQueryDto } from '../dtos/list-employees-query.dto';
import { UpdateEmployeeDto } from '../dtos/update-employee.dto';
import { EmployeeResponseDto } from '../dtos/employee-response.dto';
import { DuplicateDocumentError, EmptyDocumentNumberError, InvalidDocumentFormatError, InvalidSalaryError } from 'src/modules/empleados/domain/errors/employee.errors';
import { Roles } from '../../../../../infraestructure/auth/decorators/roles.decorator';
import { Role } from '../../../../../application/ports/auth/auth-user';
import type { AuthUser } from '../../../../../application/ports/auth/auth-user';
import { JwtAuthGuard } from '../../../../../infraestructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../infraestructure/auth/guards/roles.guard';

// Todos los endpoints exigen JWT de Supabase válido (JwtAuthGuard) y rol administrador (RolesGuard)
@ApiTags('Empleados')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('empleados')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService){}

    @Post()
    @ApiOperation({
        summary: 'Registrar empleado',
        description:
            'Registra un nuevo empleado y lo asigna a una sucursal activa. El documento debe ser único.',
    })
    @ApiCreatedResponse({
        description: 'Empleado registrado correctamente.',
        type: EmployeeResponseDto,
    })
    @ApiBadRequestResponse({
        description:
            'Datos inválidos (campos obligatorios, salario, formato de documento) o sucursal inactiva.',
        type: ErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'No se encontró la sucursal indicada.',
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Ya existe un empleado registrado con ese documento.',
        type: ErrorResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: 'Se produjo un error interno al registrar el empleado.',
        type: ErrorResponseDto,
    })
    async register(
        @Body() dto: RegisterEmployeeDto,
        @Req() request: Request & { user: AuthUser },
    ): Promise<EmployeeResponseDto>{
        // Los errores de dominio se traducen a códigos HTTP (400 validación, 409 duplicado)
        try{

            const employee = await this.employeeService.register(dto, request.user);
            return EmployeeResponseDto.fromEntity(employee);

        }catch(error){
            if (error instanceof InvalidSalaryError ||
                error instanceof EmptyDocumentNumberError ||
                error instanceof InvalidDocumentFormatError
            ) { throw new BadRequestException(error.message); }

            if (error instanceof DuplicateDocumentError) {
                throw new ConflictException(error.message);
            }

            throw error

        }
    }

    @Get()
    @ApiOperation({
        summary: 'Listar empleados',
        description:
            'Lista los empleados registrados, con búsqueda y filtros opcionales por sucursal y cargo.',
    })
    @ApiOkResponse({
        description: 'Empleados obtenidos correctamente.',
        type: EmployeeResponseDto,
        isArray: true,
    })
    @ApiInternalServerErrorResponse({
        description: 'Se produjo un error interno al consultar los empleados.',
        type: ErrorResponseDto,
    })
    async findAll(@Query() query: ListEmployeesQueryDto): Promise<EmployeeResponseDto[]> {
        return this.employeeService.findAll(query);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Editar información de empleado',
        description:
            'Actualiza los datos de un empleado. La sucursal no se edita por este medio.',
    })
    @ApiOkResponse({
        description: 'Empleado actualizado correctamente.',
        type: EmployeeResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos (salario, formato de documento) o cargo inactivo.',
        type: ErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'No se encontró el empleado o el cargo indicado.',
        type: ErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Ya existe otro empleado registrado con ese documento.',
        type: ErrorResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: 'Se produjo un error interno al actualizar el empleado.',
        type: ErrorResponseDto,
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEmployeeDto,
        @Req() request: Request & { user: AuthUser },
    ): Promise<EmployeeResponseDto> {
        try {
            return await this.employeeService.update(id, dto, request.user);
        } catch (error) {
            if (error instanceof InvalidSalaryError ||
                error instanceof EmptyDocumentNumberError ||
                error instanceof InvalidDocumentFormatError
            ) { throw new BadRequestException(error.message); }

            if (error instanceof DuplicateDocumentError) {
                throw new ConflictException(error.message);
            }

            throw error;
        }
    }
}

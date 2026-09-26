import { BadRequestException, Body, ConflictException, Controller, Post, UseGuards } from '@nestjs/common';
import { EmployeeService } from 'src/modules/empleados/application/services/employee.service';
import { RegisterEmployeeDto } from '../dtos/register-employee.dto';
import { EmployeeResponseDto } from '../dtos/employee-response.dto';
import { DuplicateDocumentError, EmptyDocumentNumberError, InvalidDocumentFormatError, InvalidSalaryError } from 'src/modules/empleados/domain/errors/employee.errors';
import { Roles } from '../../../../../infraestructure/auth/decorators/roles.decorator';
import { Role } from '../../../../../application/ports/auth/auth-user';
import { JwtAuthGuard } from '../../../../../infraestructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../infraestructure/auth/guards/roles.guard';

// Todos los endpoints exigen JWT de Supabase válido (JwtAuthGuard) y rol administrador (RolesGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Controller('empleados')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService){}

    @Post()
    async register(@Body() dto: RegisterEmployeeDto): Promise<EmployeeResponseDto>{
        // Los errores de dominio se traducen a códigos HTTP (400 validación, 409 duplicado)
        try{

            const employee = await this.employeeService.register(dto);
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
}

import { BadRequestException, Body, ConflictException, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { EmployeeService } from 'src/modules/empleados/application/services/employee.service';
import { RegisterEmployeeDto } from '../dtos/register-employee.dto';
import { EmployeeResponseDto } from '../dtos/employee-response.dto';
import { DuplicateDocumentError, EmptyDocumentNumberError, InvalidDocumentFormatError, InvalidSalaryError } from 'src/modules/empleados/domain/errors/employee.errors';


@Controller('empleados')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService){}

    @Post()
    async register(@Body() dto: RegisterEmployeeDto): Promise<EmployeeResponseDto>{
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

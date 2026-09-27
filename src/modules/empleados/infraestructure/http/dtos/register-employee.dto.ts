import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../../../../../modules/empleados/domain/value-objects/document-type.enum';

export class RegisterEmployeeDto {
  @ApiProperty({
    description: 'Nombres del empleado',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    description: 'Apellidos del empleado',
    example: 'Pérez',
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    description: 'Tipo de documento de identidad',
    enum: DocumentType,
    example: DocumentType.CC,
  })
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @ApiProperty({
    description: 'Número de documento (solo dígitos, debe ser único)',
    example: '1020304050',
  })
  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @ApiProperty({
    description: 'Número de teléfono del empleado',
    example: '3001234567',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({
    description: 'Salario base mensual (mayor que cero)',
    example: 1800000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  salaryBase!: number;

  @ApiProperty({
    description: 'Identificador del cargo activo asignado al empleado',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  positionId!: number;

  @ApiProperty({
    description: 'Identificador de la sucursal activa donde se asigna el empleado',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  branchId!: number;
}

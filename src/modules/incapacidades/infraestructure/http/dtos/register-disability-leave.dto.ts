import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisabilityType } from '../../../domain/value-objects/disability-type.enum';

export class RegisterDisabilityLeaveDto {
  @ApiProperty({
    description: 'Identificador del empleado activo al que se asocia la incapacidad',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  employeeId!: number;

  @ApiProperty({
    description: 'Tipo de incapacidad o licencia',
    enum: DisabilityType,
    example: DisabilityType.ENFERMEDAD_GENERAL,
  })
  @IsEnum(DisabilityType)
  type!: DisabilityType;

  @ApiPropertyOptional({
    description: 'Detalle del tipo cuando se selecciona "Otros"',
    example: 'Cita médica prolongada por tratamiento especializado',
  })
  // Solo es obligatorio cuando el tipo seleccionado es "Otros"
  @ValidateIf((dto: RegisterDisabilityLeaveDto) => dto.type === DisabilityType.OTROS)
  @IsString()
  @IsNotEmpty()
  otherTypeDescription?: string;

  @ApiProperty({
    description: 'Fecha de inicio de la incapacidad (ISO 8601)',
    example: '2026-09-10',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({
    description: 'Fecha de finalización de la incapacidad (ISO 8601)',
    example: '2026-09-15',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;
}

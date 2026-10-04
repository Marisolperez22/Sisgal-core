import { ApiProperty } from '@nestjs/swagger';
import { DisabilityLeave } from '../../../../../entities/disability_leave.model';
import {
  calcularEstadoIncapacidad,
  type DisabilityStatus,
} from '../../../domain/value-objects/disability-status';

export class DisabilityLeaveResponseDto {
  @ApiProperty({
    description: 'Identificador único del registro',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Identificador del empleado asociado',
    example: 1,
  })
  employeeId!: number;

  @ApiProperty({
    description: 'Nombre completo del empleado asociado',
    example: 'Juan Pérez',
  })
  employeeName!: string;

  @ApiProperty({
    description: 'Tipo de documento de identidad del empleado',
    example: 'CC',
  })
  documentType!: string;

  @ApiProperty({
    description: 'Número de documento del empleado',
    example: '1020304050',
  })
  document!: string;

  @ApiProperty({
    description: 'Cargo actual del empleado',
    example: 'Mesero',
    nullable: true,
  })
  position!: string | null;

  @ApiProperty({
    description: 'Tipo de incapacidad o licencia',
    example: 'Enfermedad general',
  })
  type!: string;

  @ApiProperty({
    description: 'Detalle del tipo cuando corresponde a "Otros"',
    example: null,
    nullable: true,
  })
  otherTypeDescription!: string | null;

  @ApiProperty({
    description: 'Fecha de inicio',
    example: '2026-09-10',
  })
  startDate!: Date;

  @ApiProperty({
    description: 'Fecha de finalización',
    example: '2026-09-15',
  })
  endDate!: Date;

  @ApiProperty({
    description: 'Cantidad de días del período',
    example: 6,
  })
  totalDays!: number;

  @ApiProperty({
    description: 'Estado de la incapacidad, calculado a partir de la fecha de finalización',
    enum: ['Activo', 'Finalizado'],
    example: 'Activo',
  })
  status!: DisabilityStatus;

  static fromEntity(disabilityLeave: DisabilityLeave): DisabilityLeaveResponseDto {
    const dto = new DisabilityLeaveResponseDto();
    dto.id = disabilityLeave.id;
    dto.employeeId = disabilityLeave.employee.id;
    dto.employeeName = `${disabilityLeave.employee.firstName} ${disabilityLeave.employee.lastName}`;
    dto.documentType = disabilityLeave.employee.document_type;
    dto.document = disabilityLeave.employee.document;
    dto.position = disabilityLeave.employee.jobPosition
      ? disabilityLeave.employee.jobPosition.name
      : null;
    dto.type = disabilityLeave.type;
    dto.otherTypeDescription = disabilityLeave.other_type_description;
    dto.startDate = disabilityLeave.start_date;
    dto.endDate = disabilityLeave.end_date;
    dto.totalDays = disabilityLeave.total_days;
    dto.status = calcularEstadoIncapacidad(disabilityLeave.end_date);
    return dto;
  }
}

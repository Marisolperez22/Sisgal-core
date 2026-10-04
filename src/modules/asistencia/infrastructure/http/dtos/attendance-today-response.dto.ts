import { ApiProperty } from '@nestjs/swagger';
import { AttendanceRecord, Employee } from 'src/entities';
import { AttendanceTodayStatus } from '../../../domain/value-objects/attendance-today-status.enum';

export class AttendanceTodayEmployeeDto {
  @ApiProperty({ description: 'Identificador del empleado', example: 1 })
  employeeId!: number;

  @ApiProperty({ example: 'María' })
  firstName!: string;

  @ApiProperty({ example: 'Pérez' })
  lastName!: string;

  @ApiProperty({
    description: 'Cargo del empleado',
    example: 'Mesero',
    nullable: true,
  })
  positionName!: string | null;

  @ApiProperty({
    description:
      'Sucursal donde registró la entrada; si está ausente, su sucursal asignada.',
    example: 'Sucursal Centro',
    nullable: true,
  })
  branchName!: string | null;

  @ApiProperty({
    description:
      'Primera entrada registrada durante el día. Es null si el empleado está ausente.',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  checkIn!: Date | null;

  @ApiProperty({
    description:
      'PRESENTE si registró una entrada durante el día; AUSENTE si no.',
    enum: AttendanceTodayStatus,
    example: AttendanceTodayStatus.PRESENTE,
  })
  status!: AttendanceTodayStatus;

  /**
   * @param firstRecord Primera marcación del empleado en el día, si la tiene.
   */
  static fromEmployee(
    employee: Employee,
    firstRecord?: AttendanceRecord,
  ): AttendanceTodayEmployeeDto {
    const dto = new AttendanceTodayEmployeeDto();
    const sucursalAsignada = employee.employee_branch_assig?.find(
      (asignacion) => asignacion.is_current,
    )?.branch;

    dto.employeeId = employee.id;
    dto.firstName = employee.firstName;
    dto.lastName = employee.lastName;
    dto.positionName = employee.jobPosition?.name ?? employee.position ?? null;
    dto.branchName =
      firstRecord?.branch?.name ?? sucursalAsignada?.name ?? null;
    dto.checkIn = firstRecord ? firstRecord.check_in : null;
    dto.status = firstRecord
      ? AttendanceTodayStatus.PRESENTE
      : AttendanceTodayStatus.AUSENTE;

    return dto;
  }
}

export class AttendanceTodayResponseDto {
  @ApiProperty({
    description: 'Día consultado (YYYY-MM-DD), en hora de Colombia.',
    example: '2026-10-04',
  })
  fecha!: string;

  @ApiProperty({
    description: 'Fecha y hora en que se generó la información.',
    type: String,
    format: 'date-time',
  })
  actualizadoEn!: Date;

  @ApiProperty({ description: 'Empleados activos.', example: 12 })
  totalEmpleados!: number;

  @ApiProperty({
    description: 'Empleados activos con entrada registrada hoy.',
    example: 9,
  })
  presentes!: number;

  @ApiProperty({
    description: 'Empleados activos sin entrada registrada hoy.',
    example: 3,
  })
  ausentes!: number;

  @ApiProperty({
    description:
      'Empleados activos: primero los presentes por hora de entrada y luego los ausentes por nombre.',
    type: AttendanceTodayEmployeeDto,
    isArray: true,
  })
  data!: AttendanceTodayEmployeeDto[];
}

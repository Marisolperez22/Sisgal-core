import { ApiProperty } from '@nestjs/swagger';
import { AttendanceRecord } from 'src/entities';
import { AttendanceRecordStatus } from '../../../domain/value-objects/attendance-record-status.enum';
import { WorkedTime } from '../../../domain/value-objects/worked-time.vo';

export class AttendanceHistoryEmployeeDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'María' })
  firstName!: string;

  @ApiProperty({ example: 'Pérez' })
  lastName!: string;

  @ApiProperty({
    description: 'Tipo de documento de identidad',
    example: 'CC',
  })
  documentType!: string;

  @ApiProperty({ example: '123456789' })
  document!: string;
}

export class AttendanceHistoryItemDto {
  @ApiProperty({
    description: 'Identificador único del registro de asistencia',
    example: 1,
  })
  id!: number;

  @ApiProperty({ type: AttendanceHistoryEmployeeDto })
  employee!: AttendanceHistoryEmployeeDto;

  @ApiProperty({
    description: 'Identificador de la sucursal donde se registró la asistencia',
    example: 1,
    nullable: true,
  })
  branchId!: number | null;

  @ApiProperty({
    description: 'Nombre de la sucursal donde se registró la asistencia',
    example: 'Sucursal Centro',
    nullable: true,
  })
  branchName!: string | null;

  @ApiProperty({
    description: 'Fecha y hora de entrada',
    type: String,
    format: 'date-time',
  })
  checkIn!: Date;

  @ApiProperty({
    description: 'Fecha y hora de salida. Es null en un registro incompleto.',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  checkOut!: Date | null;

  @ApiProperty({
    description:
      'Minutos trabajados: diferencia entre la salida y la entrada. Es null en un registro incompleto.',
    example: 480,
    nullable: true,
  })
  workedMinutes!: number | null;

  @ApiProperty({
    description: 'Un registro sin hora de salida se considera incompleto.',
    enum: AttendanceRecordStatus,
    example: AttendanceRecordStatus.COMPLETO,
  })
  status!: AttendanceRecordStatus;

  static fromEntity(entity: AttendanceRecord): AttendanceHistoryItemDto {
    const dto = new AttendanceHistoryItemDto();
    const workedTime = WorkedTime.fromMarks(entity.check_in, entity.check_out);

    dto.id = entity.id;
    dto.employee = {
      id: entity.employee.id,
      firstName: entity.employee.firstName,
      lastName: entity.employee.lastName,
      documentType: entity.employee.document_type,
      document: entity.employee.document,
    };
    dto.branchId = entity.branch ? entity.branch.id : null;
    dto.branchName = entity.branch ? entity.branch.name : null;
    dto.checkIn = entity.check_in;
    dto.checkOut = entity.check_out ?? null;
    dto.workedMinutes = workedTime.getMinutes();
    dto.status = workedTime.getStatus();

    return dto;
  }
}

export class AttendanceHistoryResponseDto {
  @ApiProperty({
    description: 'Registros de la página consultada, en orden cronológico.',
    type: AttendanceHistoryItemDto,
    isArray: true,
  })
  data!: AttendanceHistoryItemDto[];

  @ApiProperty({
    description: 'Total de registros que cumplen los filtros.',
    example: 57,
  })
  total!: number;

  @ApiProperty({ description: 'Página consultada.', example: 1 })
  pagina!: number;

  @ApiProperty({ description: 'Resultados por página.', example: 10 })
  porPagina!: number;

  @ApiProperty({ description: 'Cantidad de páginas disponibles.', example: 6 })
  totalPaginas!: number;

  static fromPage(
    records: AttendanceRecord[],
    total: number,
    pagina: number,
    porPagina: number,
  ): AttendanceHistoryResponseDto {
    const dto = new AttendanceHistoryResponseDto();

    dto.data = records.map((record) =>
      AttendanceHistoryItemDto.fromEntity(record),
    );
    dto.total = total;
    dto.pagina = pagina;
    dto.porPagina = porPagina;
    dto.totalPaginas = Math.ceil(total / porPagina);

    return dto;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { PayrollLine } from '../../../../../entities/payroll_line.model';

export class PayrollLineResponseDto {
  @ApiProperty({
    description: 'Nombre del concepto (ej. "Salario base", "Horas extra", "Préstamos")',
    example: 'Horas extra',
  })
  conceptName!: string;

  @ApiProperty({
    description: 'Monto del concepto',
    example: 85000,
  })
  amount!: number;

  static fromEntity(payrollLine: PayrollLine): PayrollLineResponseDto {
    const dto = new PayrollLineResponseDto();
    dto.conceptName = payrollLine.concept_name;
    dto.amount = payrollLine.amount;
    return dto;
  }
}

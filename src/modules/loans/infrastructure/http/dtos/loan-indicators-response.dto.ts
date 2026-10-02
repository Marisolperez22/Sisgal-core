import { ApiProperty } from '@nestjs/swagger';

export class LoanIndicatorsResponseDto {
  @ApiProperty({
    description: 'Cantidad total de préstamos en estado activo.',
    example: 12,
  })
  cantidadPrestamosActivos!: number;

  @ApiProperty({
    description: 'Suma del monto original de los préstamos activos.',
    example: 15000000,
  })
  montoTotalPrestamosActivos!: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class DisabilityLeaveIndicatorsResponseDto {
  @ApiProperty({
    description: 'Cantidad de incapacidades que actualmente se encuentran en estado Activo.',
    example: 5,
  })
  activeCount!: number;

  @ApiProperty({
    description: 'Suma de los días correspondientes a las incapacidades activas.',
    example: 23,
  })
  totalActiveDays!: number;
}

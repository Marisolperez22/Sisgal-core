import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: 404,
    description: 'Código HTTP del error.',
  })
  statusCode!: number;

  @ApiProperty({
    example: 'No se encontró una sucursal con el identificador 10.',
    description: 'Mensaje descriptivo del error.',
  })
  message!: string;

  @ApiProperty({
    example: 'Not Found',
    description: 'Descripción del tipo de error HTTP.',
  })
  error!: string;
}
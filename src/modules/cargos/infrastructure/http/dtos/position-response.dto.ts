import { ApiProperty } from '@nestjs/swagger';
import { Position } from '../../../../../entities/position.model';

export class PositionResponseDto {
  @ApiProperty({
    description: 'Identificador único del cargo',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Nombre del cargo',
    example: 'Cocinero',
  })
  name!: string;

  @ApiProperty({
    description: 'Descripción de las funciones del cargo',
    example: 'Preparación de alimentos en la línea caliente',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Indica si el cargo se encuentra activo',
    example: true,
  })
  is_active!: boolean;

  static fromEntity(entity: Position): PositionResponseDto {
    const dto = new PositionResponseDto();

    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description ?? null;
    dto.is_active = entity.is_active;

    return dto;
  }
}

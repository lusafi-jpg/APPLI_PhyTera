import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateFieldDto {
  @ApiProperty({ example: 'Tomate_Jardin_1', description: 'Nom du champ ou de la parcelle' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'UUID-DE-L-EXPLOITATION', description: 'ID de l\'exploitation liée' })
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty({ example: 'Culture de tomates Roma', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Tomate', description: 'Type de culture (ex: Tomate, Maïs, Blé)' })
  @IsString()
  @IsNotEmpty()
  cultureType: string;

  @ApiProperty({ example: 'Roma', required: false, description: 'Variété cultivée' })
  @IsString()
  @IsOptional()
  variety?: string;

  @ApiProperty({ example: 250.5, required: false, description: 'Superficie en m²' })
  @IsNumber()
  @IsOptional()
  surfaceArea?: number;

  @ApiProperty({
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [2.3522, 48.8566],
          [2.3523, 48.8567],
          [2.3524, 48.8566],
          [2.3522, 48.8566],
        ],
      ],
    },
    required: false,
    description: 'Polygone GPS au format GeoJSON',
  })
  @IsObject()
  @IsOptional()
  locationPolygon?: any;
}

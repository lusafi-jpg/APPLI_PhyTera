import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class TelemetryMeasurementDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID unique généré localement par l\'ESP32' })
  @IsString()
  @IsNotEmpty()
  clientUuid: string;

  @ApiProperty({ example: '2026-09-03T14:05:00Z', description: 'Horodatage ISO de la mesure sur l\'ESP32' })
  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({ example: 25.7, required: false, description: 'Température de l\'air en °C' })
  @IsNumber()
  @IsOptional()
  tempAir?: number;

  @ApiProperty({ example: 82, required: false, description: 'Humidité de l\'air en %' })
  @IsNumber()
  @IsOptional()
  humAir?: number;

  @ApiProperty({ example: 26.4, required: false, description: 'Température du sol en °C' })
  @IsNumber()
  @IsOptional()
  tempSol?: number;

  @ApiProperty({ example: 71, required: false, description: 'Humidité du sol en %' })
  @IsNumber()
  @IsOptional()
  humSol?: number;

  @ApiProperty({ example: 6.2, required: false, description: 'pH du sol' })
  @IsNumber()
  @IsOptional()
  phSol?: number;

  @ApiProperty({ example: 18000, required: false, description: 'Luminosité en Lux' })
  @IsNumber()
  @IsOptional()
  luminosite?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TelemetryMeasurementDto } from './telemetry-measurement.dto';

export class TelemetryBatchDto {
  @ApiProperty({ example: 'PHYTERA_ABC123', description: 'Clé unique du boîtier ESP32' })
  @IsString()
  @IsNotEmpty()
  deviceKey: string;

  @ApiProperty({ type: [TelemetryMeasurementDto], description: 'Liste des mesures capturées (par lot pour la synchro hors-ligne)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelemetryMeasurementDto)
  measurements: TelemetryMeasurementDto[];
}

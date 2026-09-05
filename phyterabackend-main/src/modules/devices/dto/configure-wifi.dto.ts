import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class ConfigureWifiDto {
  @ApiProperty({ example: 'PhyTera_Farm_WiFi', description: 'Nom du réseau Wi-Fi (SSID)' })
  @IsString()
  @IsNotEmpty()
  ssid: string;

  @ApiProperty({ example: 'MySecretPass123', description: 'Mot de passe du réseau Wi-Fi', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: '192.168.1.105', description: 'Adresse IP du boîtier sur le réseau', required: false })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ example: -65, description: 'Force du signal Wi-Fi (RSSI en dBm)', required: false })
  @IsNumber()
  @IsOptional()
  signalQuality?: number;
}

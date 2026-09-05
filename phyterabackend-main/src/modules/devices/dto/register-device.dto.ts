import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { DeviceStatus } from '@prisma/client';

export class RegisterDeviceDto {
  @ApiProperty({ example: 'SN-PHYTERA-2026-001', description: 'Numéro de série unique du boîtier ESP32' })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({ example: 'UUID-DU-CHAMP', description: 'ID du champ auquel associer le boîtier' })
  @IsString()
  @IsNotEmpty()
  fieldId: string;

  @ApiProperty({ example: 'ESP32_PHYTERA', default: 'ESP32_PHYTERA' })
  @IsString()
  @IsOptional()
  deviceType?: string;

  @ApiProperty({ example: 'v1.0.4', default: '1.0.0' })
  @IsString()
  @IsOptional()
  firmwareVersion?: string;

  @ApiProperty({ enum: DeviceStatus, default: DeviceStatus.ACTIVE })
  @IsEnum(DeviceStatus)
  @IsOptional()
  status?: DeviceStatus;
}

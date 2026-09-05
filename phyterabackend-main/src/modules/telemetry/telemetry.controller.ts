import { Controller, Post, Body, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { TelemetryBatchDto } from './dto/telemetry-batch.dto';
import { DeviceKeyGuard } from '../auth/device-key.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Telemetry IoT')
@Controller('api/v1/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @ApiOperation({ summary: 'Endpoint d\'ingestion par lot pour boîtier ESP32 (Authentification x-device-key)' })
  @ApiHeader({ name: 'x-device-key', description: 'Clé unique du boîtier ESP32', required: true })
  @UseGuards(DeviceKeyGuard)
  @Post('batch')
  processBatch(@Req() req: any, @Body() dto: TelemetryBatchDto) {
    return this.telemetryService.processBatch(req.device, dto);
  }

  @ApiOperation({ summary: 'Obtenir l\'historique des mesures d\'un champ (Application mobile & web)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('field/:fieldId')
  getTelemetryForField(@Param('fieldId') fieldId: string, @Query('limit') limit?: number) {
    return this.telemetryService.getTelemetryForField(fieldId, limit || 100);
  }

  @ApiOperation({ summary: 'Obtenir la toute dernière mesure d\'un champ' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('field/:fieldId/latest')
  getLatestTelemetryForField(@Param('fieldId') fieldId: string) {
    return this.telemetryService.getLatestTelemetryForField(fieldId);
  }
}

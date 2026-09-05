import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TelemetryBatchDto } from './dto/telemetry-batch.dto';
import { RuleEngineService } from '../rule-engine/rule-engine.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    private prisma: PrismaService,
    private ruleEngineService: RuleEngineService,
    private realtimeGateway: RealtimeGateway,
    private devicesService: DevicesService,
  ) {}

  async processBatch(device: any, dto: TelemetryBatchDto) {
    const accepted: string[] = [];
    const rejected: string[] = [];

    const fieldId = device.fieldId;
    const userId = device.field.farm.ownerId;

    for (const measurement of dto.measurements) {
      try {
        // Protection contre les doublons via clientUuid (idempotence hors-ligne)
        const existing = await this.prisma.sensorData.findUnique({
          where: { clientUuid: measurement.clientUuid },
        });

        if (existing) {
          this.logger.debug(`Mesure ignorée (déjà ingérée): ${measurement.clientUuid}`);
          accepted.push(measurement.clientUuid); // Déjà accepté
          continue;
        }

        const created = await this.prisma.sensorData.create({
          data: {
            clientUuid: measurement.clientUuid,
            deviceId: device.id,
            fieldId: fieldId,
            timestamp: new Date(measurement.timestamp),
            tempAir: measurement.tempAir,
            humAir: measurement.humAir,
            tempSol: measurement.tempSol,
            humSol: measurement.humSol,
            phSol: measurement.phSol,
            luminosite: measurement.luminosite,
            rawPayload: measurement as any,
          },
        });

        accepted.push(measurement.clientUuid);

        // Évaluation agronomique & alertes en arrière-plan
        await this.ruleEngineService.evaluate({
          fieldId,
          deviceId: device.id,
          userId,
          tempAir: measurement.tempAir,
          humAir: measurement.humAir,
          tempSol: measurement.tempSol,
          humSol: measurement.humSol,
          phSol: measurement.phSol,
          luminosite: measurement.luminosite,
        });

        // Diffusion temps réel sur les canal WebSockets
        this.realtimeGateway.emitNewMeasure(fieldId, device.id, userId, created);
      } catch (error) {
        this.logger.error(`Erreur d'ingestion pour clientUuid ${measurement.clientUuid}: ${error.message}`);
        rejected.push(measurement.clientUuid);
      }
    }

    // Mettre à jour lastSeen sur le boîtier
    await this.devicesService.updateLastSeen(device.id);

    return {
      status: 'ok',
      accepted,
      rejected,
      serverTime: new Date().toISOString(),
    };
  }

  async getTelemetryForField(fieldId: string, limit = 100) {
    return this.prisma.sensorData.findMany({
      where: { fieldId },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
    });
  }

  async getLatestTelemetryForField(fieldId: string) {
    return this.prisma.sensorData.findFirst({
      where: { fieldId },
      orderBy: { timestamp: 'desc' },
    });
  }
}

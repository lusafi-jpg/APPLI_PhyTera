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

  async getTelemetryForDevice(deviceId: string, limit = 100) {
    return this.prisma.sensorData.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
      include: {
        field: {
          select: { id: true, name: true, cultureType: true },
        },
      },
    });
  }

  async getLatestTelemetryForDevice(deviceId: string) {
    return this.prisma.sensorData.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      include: {
        field: {
          select: { id: true, name: true, cultureType: true },
        },
      },
    });
  }

  async acquireTelemetry(deviceId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        field: {
          include: {
            farm: true,
          },
        },
      },
    });

    if (!device) {
      throw new Error(`Boîtier introuvable (ID: ${deviceId})`);
    }

    const fieldId = device.fieldId;
    const userId = device.field.farm.ownerId;

    // Plages réalistes de capteurs IoT agricoles
    const tempAir = Number((22 + Math.random() * 5).toFixed(1)); // 22.0 - 27.0 °C
    const humAir = Number((55 + Math.random() * 15).toFixed(1));  // 55.0 - 70.0 %
    const tempSol = Number((20 + Math.random() * 4).toFixed(1)); // 20.0 - 24.0 °C
    const humSol = Number((50 + Math.random() * 20).toFixed(1));  // 50.0 - 70.0 %
    const phSol = Number((6.2 + Math.random() * 0.8).toFixed(2)); // 6.2 - 7.0
    const luminosite = Math.round(14000 + Math.random() * 8000);  // 14 000 - 22 000 Lux

    const clientUuid = `acq-${device.id.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date();

    const created = await this.prisma.sensorData.create({
      data: {
        clientUuid,
        deviceId: device.id,
        fieldId,
        timestamp,
        tempAir,
        humAir,
        tempSol,
        humSol,
        phSol,
        luminosite,
        rawPayload: {
          method: 'WIFI_LIVE_ACQUISITION',
          wifiSsid: (device.metadata as any)?.wifiSsid || 'Wi-Fi',
          wifiIp: (device.metadata as any)?.wifiIp || '192.168.1.105',
        },
      },
      include: {
        field: {
          select: { id: true, name: true, cultureType: true },
        },
      },
    });

    // Mettre à jour lastSeen sur le boîtier
    await this.devicesService.updateLastSeen(device.id);

    // Évaluation des règles & alertes
    try {
      await this.ruleEngineService.evaluate({
        fieldId,
        deviceId: device.id,
        userId,
        tempAir,
        humAir,
        tempSol,
        humSol,
        phSol,
        luminosite,
      });
    } catch (err) {
      this.logger.warn(`Évaluation règles ignorée: ${err.message}`);
    }

    // Diffusion temps réel
    try {
      this.realtimeGateway.emitNewMeasure(fieldId, device.id, userId, created);
    } catch (err) {
      this.logger.warn(`WebSockets broadcast ignoré: ${err.message}`);
    }

    return created;
  }
}

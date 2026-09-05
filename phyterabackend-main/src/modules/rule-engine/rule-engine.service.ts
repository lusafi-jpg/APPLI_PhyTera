import { Injectable, Logger } from '@nestjs/common';
import { AlertsService } from '../alerts/alerts.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { AlertLevel, AlertType } from '@prisma/client';

export interface EvaluateTelemetryInput {
  fieldId: string;
  deviceId: string;
  userId: string;
  tempAir?: number;
  humAir?: number;
  tempSol?: number;
  humSol?: number;
  phSol?: number;
  luminosite?: number;
}

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  constructor(
    private alertsService: AlertsService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async evaluate(data: EvaluateTelemetryInput) {
    const { fieldId, deviceId, userId, tempAir, humAir, tempSol, humSol, phSol, luminosite } = data;

    // 1. Détection du Risque de Mildiou (Humidité élevée + température favorable)
    if (humAir !== undefined && humAir >= 80 && tempAir !== undefined && tempAir >= 20 && tempAir <= 25) {
      await this.triggerAlert({
        fieldId,
        deviceId,
        userId,
        type: AlertType.MILDIOU_RISK,
        level: AlertLevel.WARNING,
        title: 'Risque élevé de Mildiou détecté',
        message: `Les conditions environnementales actuelles (Humidité air: ${humAir}%, Température air: ${tempAir}°C) sont très favorables au développement du mildiou. Recommandation: Aérer les plants et éviter l'irrigation par aspersion.`,
      });
    }

    // 2. Détection du Risque d'Oïdium
    if (humAir !== undefined && humAir >= 50 && humAir <= 70 && tempAir !== undefined && tempAir >= 20 && tempAir <= 30) {
      await this.triggerAlert({
        fieldId,
        deviceId,
        userId,
        type: AlertType.OIDIUM_RISK,
        level: AlertLevel.INFO,
        title: 'Conditions favorables à l\'Oïdium',
        message: `Humidité relative de ${humAir}% et température de ${tempAir}°C propices au blanc/oïdium. Surveiller les feuilles inférieures.`,
      });
    }

    // 3. Détection de Stress Hydrique
    if (humSol !== undefined && humSol < 35) {
      await this.triggerAlert({
        fieldId,
        deviceId,
        userId,
        type: AlertType.HYDRIC_STRESS,
        level: AlertLevel.CRITICAL,
        title: 'Alerte Stress Hydrique Critique',
        message: `L'humidité du sol a chuté à ${humSol}%. Déclencher l'irrigation rapidement pour éviter la flétrissure des cultures.`,
      });
    }

    // 4. Humidité du sol excessive (Risque d'asphyxie racinaire)
    if (humSol !== undefined && humSol > 85) {
      await this.triggerAlert({
        fieldId,
        deviceId,
        userId,
        type: AlertType.HUMIDITE_EXCESSIVE,
        level: AlertLevel.WARNING,
        title: 'Humidité du sol très élevée',
        message: `L'humidité du sol atteint ${humSol}%. Risque de saturation en eau et de pourrissement racinaire. Suspendre l'arrosage.`,
      });
    }

    // 5. pH Sol hors normes agronomiques (optimal 5.8 - 7.2)
    if (phSol !== undefined && (phSol < 5.5 || phSol > 7.5)) {
      await this.triggerAlert({
        fieldId,
        deviceId,
        userId,
        type: AlertType.PH_ANORMAL,
        level: AlertLevel.WARNING,
        title: 'Anomalie de pH dans le sol',
        message: `Le pH du sol mesuré est de ${phSol}. Un pH hors de l'intervalle [5.5 - 7.5] réduit l'assimilation des nutriments principaux (NPK).`,
      });
    }

    // 6. Températures critiques extrêmes
    if (tempAir !== undefined && (tempAir > 38 || tempAir < 5)) {
      await this.triggerAlert({
        fieldId,
        deviceId,
        userId,
        type: AlertType.TEMPERATURE_CRITIQUE,
        level: AlertLevel.CRITICAL,
        title: 'Température de l\'air critique',
        message: `Température extrême mesurée: ${tempAir}°C. Risque de gel ou de coup de chaleur sur les plants.`,
      });
    }
  }

  private async triggerAlert(params: {
    fieldId: string;
    deviceId: string;
    userId: string;
    type: AlertType;
    level: AlertLevel;
    title: string;
    message: string;
  }) {
    this.logger.warn(`Agronomic Alert Triggered [${params.type}]: ${params.title} on field ${params.fieldId}`);
    const alert = await this.alertsService.create({
      fieldId: params.fieldId,
      deviceId: params.deviceId,
      type: params.type,
      level: params.level,
      title: params.title,
      message: params.message,
    });

    this.realtimeGateway.emitNewAlert(params.fieldId, params.userId, alert);
  }
}

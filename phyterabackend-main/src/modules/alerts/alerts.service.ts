import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AlertLevel, AlertType } from '@prisma/client';

export interface CreateAlertParams {
  fieldId: string;
  deviceId?: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  message: string;
}

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async create(params: CreateAlertParams) {
    return this.prisma.alert.create({
      data: {
        fieldId: params.fieldId,
        deviceId: params.deviceId,
        type: params.type,
        level: params.level,
        title: params.title,
        message: params.message,
      },
      include: {
        field: true,
      },
    });
  }

  async findAllForUser(userId: string, role: string, fieldId?: string, resolved?: boolean) {
    const whereClause: any = {};
    if (fieldId) whereClause.fieldId = fieldId;
    if (resolved !== undefined) whereClause.resolved = resolved;

    if (role !== 'ADMIN') {
      whereClause.field = {
        farm: {
          ownerId: userId,
        },
      };
    }

    return this.prisma.alert.findMany({
      where: whereClause,
      include: {
        field: true,
        device: true,
      },
      orderBy: { detectedAt: 'desc' },
    });
  }

  async resolveAlert(id: string, userId: string, role: string, note?: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: { field: { include: { farm: true } } },
    });

    if (!alert) throw new NotFoundException('Alerte introuvable');
    if (role !== 'ADMIN' && alert.field.farm.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return this.prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolutionNote: note,
        resolvedById: userId,
      },
    });
  }
}

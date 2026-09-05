import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationType, NotificationPriority } from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  alertId?: string;
  title: string;
  body: string;
  type?: NotificationType;
  priority?: NotificationPriority;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        alertId: dto.alertId,
        title: dto.title,
        body: dto.body,
        type: dto.type || NotificationType.WEBSOCKET,
        priority: dto.priority || NotificationPriority.MEDIUM,
      },
    });

    // Émission temps réel vers Socket.io pour les applications web, mobiles et montres
    this.realtimeGateway.emitNotificationToUser(dto.userId, notification);

    return notification;
  }

  async findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        alert: true,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }
}

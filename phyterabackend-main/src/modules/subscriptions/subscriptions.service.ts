import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getSubscriptionForUser(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, active: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!sub) throw new NotFoundException('Aucun abonnement actif trouvé');
    return sub;
  }

  async updatePlan(userId: string, plan: SubscriptionPlan) {
    const limitsMap = {
      STANDARD: { maxFarms: 2, maxFields: 5, maxDevicesPerField: 2, droneVolsPerSeason: 1 },
      PRO: { maxFarms: 5, maxFields: 15, maxDevicesPerField: 5, droneVolsPerSeason: 2 },
      PREMIUM: { maxFarms: 99, maxFields: 99, maxDevicesPerField: 20, droneVolsPerSeason: 5 },
    };

    return this.prisma.subscription.create({
      data: {
        userId,
        plan,
        active: true,
        limits: limitsMap[plan] || limitsMap.STANDARD,
      },
    });
  }
}

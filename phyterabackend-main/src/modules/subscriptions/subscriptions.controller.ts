import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { SubscriptionPlan } from '@prisma/client';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: 'Obtenir l\'abonnement et les limites actuelles' })
  @Get()
  getSubscription(@GetUser('id') userId: string) {
    return this.subscriptionsService.getSubscriptionForUser(userId);
  }

  @ApiOperation({ summary: 'Changer ou renouveler son plan d\'abonnement (STANDARD, PRO, PREMIUM)' })
  @Post('upgrade')
  updatePlan(@GetUser('id') userId: string, @Body('plan') plan: SubscriptionPlan) {
    return this.subscriptionsService.updatePlan(userId, plan);
  }
}

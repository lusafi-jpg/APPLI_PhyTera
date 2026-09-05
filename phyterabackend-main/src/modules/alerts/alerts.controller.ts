import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @ApiOperation({ summary: 'Lister les alertes agronomiques de mes champs' })
  @Get()
  findAll(
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
    @Query('fieldId') fieldId?: string,
    @Query('resolved') resolved?: string,
  ) {
    const isResolved = resolved !== undefined ? resolved === 'true' : undefined;
    return this.alertsService.findAllForUser(userId, role, fieldId, isResolved);
  }

  @ApiOperation({ summary: 'Marquer une alerte comme résolue' })
  @Post(':id/resolve')
  resolve(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
    @Body('resolutionNote') note?: string,
  ) {
    return this.alertsService.resolveAlert(id, userId, role, note);
  }
}

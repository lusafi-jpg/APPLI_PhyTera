import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import { MaintenanceService, CreateTicketDto, UpdateTicketDto } from './maintenance.service';

@ApiTags('Maintenance & Techniciens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post('tickets')
  @Roles(Role.TECHNICIEN, Role.ADMIN)
  @ApiOperation({ summary: "Ouvrir un ticket d'intervention technique sur un boîtier" })
  async createTicket(@GetUser('id') technicianId: string, @Body() dto: Omit<CreateTicketDto, 'technicianId'>) {
    return this.maintenanceService.create({ ...dto, technicianId });
  }

  @Patch('tickets/:id')
  @Roles(Role.TECHNICIEN, Role.ADMIN)
  @ApiOperation({ summary: "Mettre à jour le statut et la note de résolution d'un ticket de maintenance" })
  async updateTicket(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.maintenanceService.update(id, dto);
  }

  @Get('my-interventions')
  @Roles(Role.TECHNICIEN, Role.ADMIN)
  @ApiOperation({ summary: "Consulter les tickets d'intervention assignés au technicien connecté" })
  async getMyInterventions(@GetUser('id') technicianId: string) {
    return this.maintenanceService.findForTechnician(technicianId);
  }

  @Get('device/:deviceId')
  @Roles(Role.AGRICULTEUR, Role.TECHNICIEN, Role.ADMIN)
  @ApiOperation({ summary: "Historique des maintenances pour un boîtier donné" })
  async getDeviceTickets(@Param('deviceId') deviceId: string) {
    return this.maintenanceService.findForDevice(deviceId);
  }
}

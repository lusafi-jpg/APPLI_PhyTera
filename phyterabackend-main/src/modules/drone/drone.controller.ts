import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DroneService, CreateDroneMissionDto } from './drone.service';

@ApiTags('Drone & Imagerie Multispectrale')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/drone')
export class DroneController {
  constructor(private readonly droneService: DroneService) {}

  @Post('missions')
  @ApiOperation({ summary: "Enregistrer un survol de drone et les cartographies (NDVI / Thermique)" })
  async createMission(@Body() dto: CreateDroneMissionDto) {
    return this.droneService.createMission(dto);
  }

  @Get('field/:fieldId')
  @ApiOperation({ summary: "Consulter l'historique des missions de drone et cartes de végétation d'un champ" })
  async getMissionsByField(@Param('fieldId') fieldId: string) {
    return this.droneService.findByField(fieldId);
  }
}

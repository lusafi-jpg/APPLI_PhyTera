import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MissionStatus } from '@prisma/client';

export interface CreateDroneMissionDto {
  fieldId: string;
  flightDate?: Date;
  pilotName?: string;
  status?: MissionStatus;
  ndviMapUrl?: string;
  thermalMapUrl?: string;
  metadataJson?: any;
}

@Injectable()
export class DroneService {
  constructor(private readonly prisma: PrismaService) {}

  async createMission(dto: CreateDroneMissionDto) {
    const field = await this.prisma.field.findUnique({ where: { id: dto.fieldId } });
    if (!field) {
      throw new NotFoundException(`Champ ${dto.fieldId} introuvable`);
    }

    return this.prisma.droneMission.create({
      data: {
        fieldId: dto.fieldId,
        flightDate: dto.flightDate || new Date(),
        pilotName: dto.pilotName,
        status: dto.status || MissionStatus.COMPLETED,
        ndviMapUrl: dto.ndviMapUrl,
        thermalMapUrl: dto.thermalMapUrl,
        metadataJson: dto.metadataJson,
      },
    });
  }

  async findByField(fieldId: string) {
    return this.prisma.droneMission.findMany({
      where: { fieldId },
      orderBy: { flightDate: 'desc' },
    });
  }
}

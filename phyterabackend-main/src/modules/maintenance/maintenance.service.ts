import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TicketStatus } from '@prisma/client';

export interface CreateTicketDto {
  deviceId: string;
  technicianId: string;
  title: string;
  issueDescription: string;
}

export interface UpdateTicketDto {
  status?: TicketStatus;
  resolutionNote?: string;
  interventionDate?: Date;
}

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto) {
    const device = await this.prisma.device.findUnique({ where: { id: dto.deviceId } });
    if (!device) {
      throw new NotFoundException(`Boîtier ${dto.deviceId} introuvable`);
    }

    return this.prisma.maintenanceTicket.create({
      data: {
        deviceId: dto.deviceId,
        technicianId: dto.technicianId,
        title: dto.title,
        issueDescription: dto.issueDescription,
        status: TicketStatus.OPEN,
      },
    });
  }

  async update(id: string, dto: UpdateTicketDto) {
    const ticket = await this.prisma.maintenanceTicket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket de maintenance ${id} introuvable`);
    }

    return this.prisma.maintenanceTicket.update({
      where: { id },
      data: {
        status: dto.status ?? ticket.status,
        resolutionNote: dto.resolutionNote ?? ticket.resolutionNote,
        interventionDate: dto.interventionDate ?? ticket.interventionDate,
      },
    });
  }

  async findForTechnician(technicianId: string) {
    return this.prisma.maintenanceTicket.findMany({
      where: { technicianId },
      orderBy: { createdAt: 'desc' },
      include: {
        device: {
          include: { field: true },
        },
      },
    });
  }

  async findForDevice(deviceId: string) {
    return this.prisma.maintenanceTicket.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
      include: {
        technician: {
          select: { id: true, nom: true, email: true },
        },
      },
    });
  }
}

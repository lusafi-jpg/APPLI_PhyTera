import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, role: string, dto: RegisterDeviceDto) {
    const field = await this.prisma.field.findUnique({
      where: { id: dto.fieldId },
      include: { farm: true },
    });
    if (!field) throw new NotFoundException('Champ introuvable');
    if (role !== 'ADMIN' && field.farm.ownerId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas propriétaire de l\'exploitation liée à ce champ');
    }

    const existingSerial = await this.prisma.device.findUnique({
      where: { serialNumber: dto.serialNumber },
    });
    if (existingSerial) {
      throw new ConflictException('Ce numéro de série est déjà enregistré');
    }

    const deviceKey = `PHYTERA_${crypto.randomBytes(12).toString('hex').toUpperCase()}`;

    return this.prisma.device.create({
      data: {
        deviceKey,
        serialNumber: dto.serialNumber,
        fieldId: dto.fieldId,
        deviceType: dto.deviceType || 'ESP32_PHYTERA',
        firmwareVersion: dto.firmwareVersion || '1.0.0',
        status: dto.status || 'ACTIVE',
      },
    });
  }

  async findAllForUser(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.device.findMany({
        include: { field: { include: { farm: true } } },
      });
    }
    return this.prisma.device.findMany({
      where: {
        field: {
          farm: {
            ownerId: userId,
          },
        },
      },
      include: { field: true },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: { field: { include: { farm: true } } },
    });
    if (!device) throw new NotFoundException('Boîtier introuvable');
    if (role !== 'ADMIN' && device.field.farm.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé à ce boîtier');
    }
    return device;
  }

  async rotateKey(id: string, userId: string, role: string) {
    await this.findOne(id, userId, role);
    const newDeviceKey = `PHYTERA_${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
    return this.prisma.device.update({
      where: { id },
      data: { deviceKey: newDeviceKey },
    });
  }

  async updateLastSeen(deviceId: string) {
    return this.prisma.device.update({
      where: { id: deviceId },
      data: { lastSeen: new Date() },
    });
  }

  async remove(id: string, userId: string, role: string) {
    await this.findOne(id, userId, role);
    return this.prisma.device.delete({ where: { id } });
  }
}

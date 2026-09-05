import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFarmDto } from './dto/create-farm.dto';

@Injectable()
export class FarmsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFarmDto) {
    return this.prisma.farm.create({
      data: {
        ...dto,
        ownerId: userId,
      },
    });
  }

  async findAllForUser(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.farm.findMany({
        include: { owner: { select: { id: true, nom: true, email: true } }, fields: true },
      });
    }
    return this.prisma.farm.findMany({
      where: { ownerId: userId },
      include: { fields: true },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: { fields: { include: { devices: true } } },
    });

    if (!farm) throw new NotFoundException('Exploitation introuvable');
    if (role !== 'ADMIN' && farm.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé à cette exploitation');
    }

    return farm;
  }

  async update(id: string, userId: string, role: string, dto: Partial<CreateFarmDto>) {
    await this.findOne(id, userId, role);
    return this.prisma.farm.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string, role: string) {
    await this.findOne(id, userId, role);
    return this.prisma.farm.delete({ where: { id } });
  }
}

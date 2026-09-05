import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFieldDto } from './dto/create-field.dto';

@Injectable()
export class FieldsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, role: string, dto: CreateFieldDto) {
    const farm = await this.prisma.farm.findUnique({ where: { id: dto.farmId } });
    if (!farm) throw new NotFoundException('Exploitation introuvable');
    if (role !== 'ADMIN' && farm.ownerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez ajouter un champ qu\'à vos propres exploitations');
    }

    return this.prisma.field.create({
      data: {
        name: dto.name,
        farmId: dto.farmId,
        description: dto.description,
        cultureType: dto.cultureType,
        variety: dto.variety,
        surfaceArea: dto.surfaceArea,
        locationPolygon: dto.locationPolygon,
      },
    });
  }

  async findAllForFarm(farmId: string, userId: string, role: string) {
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) throw new NotFoundException('Exploitation introuvable');
    if (role !== 'ADMIN' && farm.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return this.prisma.field.findMany({
      where: { farmId },
      include: { devices: true, alerts: { where: { resolved: false } } },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const field = await this.prisma.field.findUnique({
      where: { id },
      include: { farm: true, devices: true, alerts: true },
    });
    if (!field) throw new NotFoundException('Champ introuvable');
    if (role !== 'ADMIN' && field.farm.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }
    return field;
  }

  async update(id: string, userId: string, role: string, dto: Partial<CreateFieldDto>) {
    await this.findOne(id, userId, role);
    return this.prisma.field.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string, role: string) {
    await this.findOne(id, userId, role);
    return this.prisma.field.delete({ where: { id } });
  }
}

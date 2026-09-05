import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateFieldRuleDto {
  name: string;
  cultureType: string;
  tempAirMin?: number;
  tempAirMax?: number;
  humAirMin?: number;
  humAirMax?: number;
  tempSolMin?: number;
  tempSolMax?: number;
  humSolMin?: number;
  humSolMax?: number;
  phSolMin?: number;
  phSolMax?: number;
  enabled?: boolean;
}

@Injectable()
export class FieldRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(fieldId: string, dto: CreateFieldRuleDto) {
    const field = await this.prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      throw new NotFoundException(`Champ ${fieldId} introuvable`);
    }

    return this.prisma.fieldRule.create({
      data: {
        fieldId,
        name: dto.name,
        cultureType: dto.cultureType || field.cultureType,
        tempAirMin: dto.tempAirMin,
        tempAirMax: dto.tempAirMax,
        humAirMin: dto.humAirMin,
        humAirMax: dto.humAirMax,
        tempSolMin: dto.tempSolMin,
        tempSolMax: dto.tempSolMax,
        humSolMin: dto.humSolMin,
        humSolMax: dto.humSolMax,
        phSolMin: dto.phSolMin,
        phSolMax: dto.phSolMax,
        enabled: dto.enabled ?? true,
      },
    });
  }

  async findByField(fieldId: string) {
    return this.prisma.fieldRule.findMany({
      where: { fieldId, enabled: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    return this.prisma.fieldRule.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ImageSource, CropImageStatus } from '@prisma/client';

export interface CreateCropImageDto {
  fieldId: string;
  userId: string;
  imageUrl: string;
  source?: ImageSource;
  gpsLat?: number;
  gpsLng?: number;
}

export interface UpdateCropImageDiagnosisDto {
  aiDiagnosis: string;
  confidenceScore: number;
  status: CropImageStatus;
}

@Injectable()
export class CropImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCropImageDto) {
    const field = await this.prisma.field.findUnique({ where: { id: dto.fieldId } });
    if (!field) {
      throw new NotFoundException(`Champ ${dto.fieldId} introuvable`);
    }

    return this.prisma.cropImage.create({
      data: {
        fieldId: dto.fieldId,
        userId: dto.userId,
        imageUrl: dto.imageUrl,
        source: dto.source || ImageSource.SMARTPHONE,
        gpsLat: dto.gpsLat,
        gpsLng: dto.gpsLng,
        status: CropImageStatus.PENDING,
      },
    });
  }

  async findByField(fieldId: string) {
    return this.prisma.cropImage.findMany({
      where: { fieldId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nom: true, email: true } },
      },
    });
  }

  async updateDiagnosis(id: string, dto: UpdateCropImageDiagnosisDto) {
    const image = await this.prisma.cropImage.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image de culture ${id} introuvable`);
    }

    return this.prisma.cropImage.update({
      where: { id },
      data: {
        aiDiagnosis: dto.aiDiagnosis,
        confidenceScore: dto.confidenceScore,
        status: dto.status,
      },
    });
  }
}

import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CropImagesService, CreateCropImageDto, UpdateCropImageDiagnosisDto } from './crop-images.service';

@ApiTags('Crop Images (IA)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/crop-images')
export class CropImagesController {
  constructor(private readonly cropImagesService: CropImagesService) {}

  @Post()
  @ApiOperation({ summary: "Téléverser ou enregistrer une photo de culture (Smartphone / Drone / Caméra)" })
  async uploadImage(@GetUser('id') userId: string, @Body() dto: Omit<CreateCropImageDto, 'userId'>) {
    return this.cropImagesService.create({ ...dto, userId });
  }

  @Get('field/:fieldId')
  @ApiOperation({ summary: "Consulter les photos et diagnostics IA d'un champ" })
  async getFieldImages(@Param('fieldId') fieldId: string) {
    return this.cropImagesService.findByField(fieldId);
  }

  @Patch(':id/diagnosis')
  @ApiOperation({ summary: "Enregistrer le résultat de détection IA sur une image de culture" })
  async updateDiagnosis(@Param('id') id: string, @Body() dto: UpdateCropImageDiagnosisDto) {
    return this.cropImagesService.updateDiagnosis(id, dto);
  }
}

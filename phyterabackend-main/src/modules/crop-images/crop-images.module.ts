import { Module } from '@nestjs/common';
import { CropImagesService } from './crop-images.service';
import { CropImagesController } from './crop-images.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CropImagesController],
  providers: [CropImagesService],
  exports: [CropImagesService],
})
export class CropImagesModule {}

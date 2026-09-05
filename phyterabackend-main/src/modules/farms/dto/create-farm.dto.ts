import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateFarmDto {
  @ApiProperty({ example: 'Exploitation Bio de la Vallée', description: 'Nom de l\'exploitation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Ferme spécialisée en culture de tomates', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Région Sud, Parcelle A', required: false })
  @IsString()
  @IsOptional()
  location?: string;
}

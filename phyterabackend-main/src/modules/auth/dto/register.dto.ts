import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'agriculteur@phytera.io', description: 'Email unique' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Mot de passe au moins 6 caractères' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Jean Dupont', description: 'Nom complet' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ enum: Role, default: Role.AGRICULTEUR, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

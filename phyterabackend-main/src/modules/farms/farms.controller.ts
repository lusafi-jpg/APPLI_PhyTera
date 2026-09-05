import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Farms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @ApiOperation({ summary: 'Créer une exploitation agricole' })
  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateFarmDto) {
    return this.farmsService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Lister toutes mes exploitations agricoles' })
  @Get()
  findAll(@GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.farmsService.findAllForUser(userId, role);
  }

  @ApiOperation({ summary: 'Obtenir les détails d\'une exploitation' })
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.farmsService.findOne(id, userId, role);
  }

  @ApiOperation({ summary: 'Mettre à jour une exploitation' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
    @Body() dto: CreateFarmDto,
  ) {
    return this.farmsService.update(id, userId, role, dto);
  }

  @ApiOperation({ summary: 'Supprimer une exploitation' })
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.farmsService.remove(id, userId, role);
  }
}

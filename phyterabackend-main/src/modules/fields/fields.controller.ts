import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Fields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @ApiOperation({ summary: 'Créer un nouveau champ dans une exploitation' })
  @Post()
  create(@GetUser('id') userId: string, @GetUser('role') role: string, @Body() dto: CreateFieldDto) {
    return this.fieldsService.create(userId, role, dto);
  }

  @ApiOperation({ summary: 'Lister les champs d\'une exploitation' })
  @Get()
  findAllForFarm(@Query('farmId') farmId: string, @GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.fieldsService.findAllForFarm(farmId, userId, role);
  }

  @ApiOperation({ summary: 'Obtenir les détails d\'un champ' })
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.fieldsService.findOne(id, userId, role);
  }

  @ApiOperation({ summary: 'Mettre à jour les informations ou la géométrie d\'un champ' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
    @Body() dto: Partial<CreateFieldDto>,
  ) {
    return this.fieldsService.update(id, userId, role, dto);
  }

  @ApiOperation({ summary: 'Supprimer un champ' })
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.fieldsService.remove(id, userId, role);
  }
}

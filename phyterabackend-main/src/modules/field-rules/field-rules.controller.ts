import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FieldRulesService, CreateFieldRuleDto } from './field-rules.service';

@ApiTags('Field Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/fields/:fieldId/rules')
export class FieldRulesController {
  constructor(private readonly fieldRulesService: FieldRulesService) {}

  @Post()
  @ApiOperation({ summary: "Créer une règle agronomique sur-mesure pour un champ" })
  async createRule(@Param('fieldId') fieldId: string, @Body() dto: CreateFieldRuleDto) {
    return this.fieldRulesService.create(fieldId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Consulter les règles personnalisées actives d'un champ" })
  async getRules(@Param('fieldId') fieldId: string) {
    return this.fieldRulesService.findByField(fieldId);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer une règle sur-mesure de champ" })
  async deleteRule(@Param('id') id: string) {
    return this.fieldRulesService.delete(id);
  }
}

import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @ApiOperation({ summary: 'Enregistrer un nouveau boîtier PhyTera (ESP32)' })
  @Post('register')
  register(
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.devicesService.register(userId, role, dto);
  }

  @ApiOperation({ summary: 'Lister tous mes boîtiers PhyTera' })
  @Get()
  findAll(@GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.devicesService.findAllForUser(userId, role);
  }

  @ApiOperation({ summary: 'Obtenir les détails d\'un boîtier' })
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.devicesService.findOne(id, userId, role);
  }

  @ApiOperation({ summary: 'Régénérer la clé unique (deviceKey) d\'un boîtier' })
  @Post(':id/rotate-key')
  rotateKey(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.devicesService.rotateKey(id, userId, role);
  }

  @ApiOperation({ summary: 'Désassocier ou supprimer un boîtier' })
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: string) {
    return this.devicesService.remove(id, userId, role);
  }
}

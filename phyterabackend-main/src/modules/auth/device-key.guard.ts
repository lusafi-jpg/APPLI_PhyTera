import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DeviceKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const deviceKey = request.headers['x-device-key'] || request.body?.device_key;

    if (!deviceKey) {
      throw new UnauthorizedException('En-tête ou clé d\'appareil (x-device-key / device_key) manquante');
    }

    const device = await this.prisma.device.findUnique({
      where: { deviceKey: String(deviceKey) },
      include: {
        field: {
          include: {
            farm: true,
          },
        },
      },
    });

    if (!device) {
      throw new UnauthorizedException('Boîtier ESP32 invalide ou non enregistré');
    }

    if (device.status === 'DISABLED') {
      throw new UnauthorizedException('Boîtier désactivé');
    }

    // Attacher le boîtier à la requête HTTP pour utilisation par le controller
    request.device = device;
    return true;
  }
}

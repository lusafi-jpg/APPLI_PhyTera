import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connecté avec succès à la base de données PostgreSQL.');
    } catch (err) {
      this.logger.warn(
        `⚠️ Connexion PostgreSQL impossible (DATABASE_URL): ${err.message}. Le serveur NestJS continue de tourner.`
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (err) { }
  }
}

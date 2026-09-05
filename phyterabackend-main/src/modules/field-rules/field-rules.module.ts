import { Module } from '@nestjs/common';
import { FieldRulesService } from './field-rules.service';
import { FieldRulesController } from './field-rules.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FieldRulesController],
  providers: [FieldRulesService],
  exports: [FieldRulesService],
})
export class FieldRulesModule {}

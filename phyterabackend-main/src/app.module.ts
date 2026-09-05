import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FarmsModule } from './modules/farms/farms.module';
import { FieldsModule } from './modules/fields/fields.module';
import { DevicesModule } from './modules/devices/devices.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FieldRulesModule } from './modules/field-rules/field-rules.module';
import { CropImagesModule } from './modules/crop-images/crop-images.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { DroneModule } from './modules/drone/drone.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    FarmsModule,
    FieldsModule,
    DevicesModule,
    TelemetryModule,
    RuleEngineModule,
    AlertsModule,
    RealtimeModule,
    SubscriptionsModule,
    AuditModule,
    NotificationsModule,
    FieldRulesModule,
    CropImagesModule,
    MaintenanceModule,
    DroneModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}

# Plan d'implémentation Backend PhyTera — Architecture NestJS + Prisma (PostgreSQL)

PhyTera est un backend IoT et agrotech central de surveillance agricole intelligente. Initialement conçu sur une pile Django/Firebase, nous transposons l'ensemble des spécifications fonctionnelles de [`logic.md`](file:///d:/phytera/logic.md) vers une architecture enterprise-grade **NestJS**, **Prisma ORM**, **PostgreSQL** (compatible Supabase), **Redis**, et **WebSockets (Socket.io)** sans Firebase.

---

## 1. Choix d'Architecture & Normes "Tech Lead"

1. **NestJS Modular Architecture** :
   - Structure par modules métier étanches (`auth`, `users`, `farms`, `fields`, `devices`, `telemetry`, `rule-engine`, `alerts`, `realtime`, `subscriptions`).
   - Injection de dépendances et inversion de contrôle strictes.
   - DTOs validés par `class-validator` et `class-transformer`.
   - Documentation OpenAPI (Swagger) générée automatiquement.

2. **Prisma ORM & PostgreSQL** :
   - Schema Prisma type-safe avec types enums (`UserRole`, `DeviceStatus`, `AlertLevel`, `SubscriptionPlan`).
   - Gestion des données spatiales (polygones GPS pour les champs) via GeoJSON ou extensions PostGIS.
   - Indexation optimisée sur `client_uuid` (déduplication IoT), `timestamp`, `device_id`, `field_id` et `user_id`.

3. **Stratégie IoT & Ingestion Hors-ligne** :
   - Endpoints d'ingestion par lot (`/api/v1/devices/telemetry/batch`) acceptant les requêtes des boîtiers ESP32 avec clé d'appareil (`device_key`).
   - Garantie d'idempotence via `client_uuid` (UPSERT ou vérification avant insertion) pour éviter les doublons lors des reconnexions.

4. **Moteur de Règles & Alertes (Agronomie)** :
   - Service d'évaluation des règles agronomiques (Mildiou, Oïdium, Stress hydrique, pH critique, etc.).
   - Distinctions claires entre `RISQUE_DETECTE` (sur la base de seuils environnementaux) et `MALADIE_CONFIRMEE` (préparation pour les modèles IA d'images futurs).

5. **Temps Réel (WebSockets)** :
   - Gateways Socket.io / NestJS WebSockets avec canaux sécurisés (`user_{id}`, `field_{id}`, `device_{id}`).
   - Adapter Redis IoAdapter pour un scaling horizontal multi-instances.

6. **Sécurité & Isolation Multi-tenancy** :
   - Authentification JWT avec stratégie Refresh/Access Tokens (`@nestjs/jwt`, `passport-jwt`).
   - Guards RBAC (`@Roles(...)`) et Guards d'accès aux ressources au niveau entité (propriété de l'exploitation / du champ).
   - Authentification des boîtiers ESP32 par `device_key` et support d'HMAC.

---

## 2. User Review Required

> [!IMPORTANT]
> **Points clés d'arbitrage technique :**
> 1. **Suppression complète de Firebase** : Toute la synchronisation temps réel se fera directement via les WebSockets NestJS (Socket.io) et PostgreSQL sera la source unique de vérité.
> 2. **Base de données Spatiale** : Les polygones des champs seront stockés sous forme de structure JSON/GeoJSON dans PostgreSQL via Prisma, avec préparation à l'extension PostGIS de Supabase pour le calcul direct de superficies.
> 3. **Gestion des tâches asynchrones** : Au lieu de Celery/Redis, nous utiliserons **BullMQ / Redis** avec NestJS pour le traitement asynchrone des analyses agronomiques lourd et la livraison des alertes/notifications.

---

## 3. Open Questions

> [!NOTE]
> - Souhaitez-vous initialiser le projet directement dans `d:\phytera` avec la CLI NestJS (`npx @nestjs/cli new`) ?
> - Souhaitez-vous que nous configurions un `docker-compose.yml` incluant PostgreSQL, Redis et l'application NestJS pour le développement local ?

---

## 4. Architecture et Structure des Fichiers Proposée

```text
d:\phytera\
├── prisma\
│   └── schema.prisma             # Modèles Prisma (User, Farm, Field, Device, SensorData, Alert, etc.)
├── src\
│   ├── main.ts                   # Point d'entrée NestJS (Swagger, ValidationPipe, CORS)
│   ├── app.module.ts             # Module racine
│   ├── common\                   # Decorators, Filters, Guards, Interceptors, Pipes
│   │   ├── decorators\
│   │   ├── filters\
│   │   ├── guards\
│   │   └── interceptors\
│   ├── database\                 # PrismaService & PrismaModule
│   ├── modules\
│   │   ├── auth\                 # Register, Login, Refresh JWT, DeviceKey Guard
│   │   ├── users\                # CustomUser Management, Profiles, Roles
│   │   ├── farms\                # Farm CRUD, Ownership
│   │   ├── fields\               # Field CRUD, GPS Polygon, GeoJSON logic
│   │   ├── devices\              # Device provisioning, Key rotation, Status (online/offline)
│   │   ├── telemetry\            # IoT Data Ingestion, Batch, Idempotency (client_uuid)
│   │   ├── rule-engine\          # Agronomic Disease Risk Evaluator (Mildiou, Stress, etc.)
│   │   ├── alerts\               # Alert generation, Resolution, History
│   │   ├── realtime\             # Socket.io Gateway, Rooms (user, field, device)
│   │   └── subscriptions\        # Quotas, Plans (Standard, Pro, Premium)
├── test\                         # E2E Tests (Jest)
├── docker-compose.yml            # PostgreSQL + Redis setup
├── package.json
└── tsconfig.json
```

---

## 5. Modèle de Données Prisma Schema (`prisma/schema.prisma`)

```prisma
enum Role {
  AGRICULTEUR
  TECHNICIEN
  ADMIN
}

enum DeviceStatus {
  ACTIVE
  OFFLINE
  MAINTENANCE
  DISABLED
}

enum AlertLevel {
  INFO
  WARNING
  CRITICAL
}

enum AlertType {
  MILDIOU_RISK
  OIDIUM_RISK
  HYDRIC_STRESS
  TEMPERATURE_EXTREME
  PH_ANORMAL
  DEVICE_OFFLINE
  CUSTOM
}

enum SubscriptionPlan {
  STANDARD
  PRO
  PREMIUM
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  password        String
  nom             String
  role            Role           @default(AGRICULTEUR)
  isActive        Boolean        @default(true)
  preferences     Json?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  farms           Farm[]
  subscriptions   Subscription[]
  alertsResolved  Alert[]        @relation("ResolvedBy")
}

model Farm {
  id          String   @id @default(uuid())
  name        String
  description String?
  location    String?
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  fields      Field[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Field {
  id              String       @id @default(uuid())
  name            String
  description     String?
  farmId          String
  farm            Farm         @relation(fields: [farmId], references: [id], onDelete: Cascade)
  locationPolygon Json?        // GeoJSON Polygon
  surfaceArea     Float?       // m² ou Hectares
  cultureType     String
  variety         String?
  timezone        String       @default("UTC")
  configLocal     Json?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  devices         Device[]
  sensorData      SensorData[]
  alerts          Alert[]
}

model Device {
  id              String       @id @default(uuid())
  deviceKey       String       @unique
  serialNumber    String       @unique
  fieldId         String
  field           Field        @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  deviceType      String       @default("ESP32_PHYTERA")
  firmwareVersion String       @default("1.0.0")
  status          DeviceStatus @default(ACTIVE)
  lastSeen        DateTime?
  metadata        Json?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  sensorData      SensorData[]
  alerts          Alert[]
}

model SensorData {
  id              String   @id @default(uuid())
  clientUuid      String   @unique // Clé d'idempotence anti-doublon IoT
  deviceId        String
  device          Device   @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  fieldId         String
  field           Field    @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  timestamp       DateTime
  tempAir         Float?
  humAir          Float?
  tempSol         Float?
  humSol          Float?
  phSol           Float?
  luminosite      Float?
  rawPayload      Json?
  originTimestamp DateTime?
  ingestedAt      DateTime @default(now())
  createdAt       DateTime @default(now())

  @@index([fieldId, timestamp])
  @@index([deviceId, timestamp])
}

model Alert {
  id             String     @id @default(uuid())
  fieldId        String
  field          Field      @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  deviceId       String?
  device         Device?    @relation(fields: [deviceId], references: [id], onDelete: SetNull)
  type           AlertType
  level          AlertLevel @default(INFO)
  title          String
  message        String
  detectedAt     DateTime   @default(now())
  resolved       Boolean    @default(false)
  resolvedAt     DateTime?
  resolutionNote String?
  resolvedById   String?
  resolvedBy     User?      @relation("ResolvedBy", fields: [resolvedById], references: [id])
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@index([fieldId, resolved])
}

model Subscription {
  id        String           @id @default(uuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan      SubscriptionPlan @default(STANDARD)
  startDate DateTime         @default(now())
  endDate   DateTime?
  active    Boolean          @default(true)
  limits    Json?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
}
```

---

## 6. Plan d'Exécution par Phases

### Phase 1 : Initialisation du projet & Base de Données
- Initialiser le projet NestJS avec TypeScript.
- Installer & Configurer Prisma ORM, PostgreSQL client, Swagger, ValidationPipes.
- Rédiger et exécuter la migration initiale Prisma.
- Créer le `DatabaseModule` et `PrismaService`.

### Phase 2 : Authentification & Sécurité Multi-tenancy
- Module `Auth` : JWT Access Tokens (court) + Refresh Tokens (longs).
- Hachage des mots de passe avec `bcrypt`.
- Guards `JwtAuthGuard`, `RolesGuard` (AGRICULTEUR, TECHNICIEN, ADMIN).
- Guard d'authentification pour les boîtiers ESP32 via la header `X-Device-Key`.

### Phase 3 : Modèles Métier & APIs REST (CRUD)
- Module `Farms` : CRUD complet avec contrôle strict de propriété (`ownerId == user.id`).
- Module `Fields` : CRUD, gestion des coordonnées GPS (Polygones GeoJSON) et calcul de surface.
- Module `Devices` : Génération de `deviceKey` sécurisée, association aux champs, mise à jour du statut `lastSeen`.

### Phase 4 : Ingestion IoT & Anti-doublons (Hors-ligne)
- Endpoint `POST /api/v1/devices/telemetry/batch` :
  - Parsing du batch transmis par l'ESP32.
  - Traitement idempotent avec `clientUuid` pour éviter les retentatives en doublon.
  - Mise à jour atomique de `lastSeen` du boîtier.

### Phase 5 : Moteur de Règles Agronomiques & Alertes
- Service `RuleEngineService` :
  - Analyse en temps réel des mesures entrantes (Ex: Temp > 20°C & HumAir > 80% => Risque Mildiou).
  - Émission d'alertes automatiques (`AlertService`) enregistrées en BDD.

### Phase 6 : WebSocket Temps Réel (Socket.io Gateway)
- `RealtimeGateway` NestJS avec authentification par Token JWT.
- Abonnements dynamiques aux rooms : `user_{userId}`, `field_{fieldId}`, `device_{deviceId}`.
- Émission instantanée des nouvelles mesures (`new_measure`) et alertes (`new_alert`).

### Phase 7 : Abonnements, Validation et Tests
- Module `Subscriptions` pour limiter le nombre de champs/boîtiers par type de plan.
- Validation des DTOs avec `class-validator`.
- Tests unitaires et E2E (Jest).

---

## 7. Plan de Vérification

### Tests Automatisés
- Compilation TypeScript sans erreur (`npm run build`).
- Validation des schémas DTO et des réponses API via Swagger (`/api/docs`).
- Tests d'intégration des endpoints d'ingestion IoT (scénario avec retentatives et doublons `client_uuid`).

### Vérification Manuelle
- Ingestion simulée de mesures ESP32 via des requêtes HTTP (`curl` / Postman).
- Connexion WebSocket pour vérifier la réception instantanée des paquets de données et alertes.

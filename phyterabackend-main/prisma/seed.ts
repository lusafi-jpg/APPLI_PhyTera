import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { PrismaClient, Role, DeviceStatus, AlertType, AlertLevel, SubscriptionPlan, NotificationType, NotificationPriority, CropImageStatus, TicketStatus, MissionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Démarrage du peuplement (Seed) de la base de données PostgreSQL...');

    // Nettoyage préalable des tables
    await prisma.notification.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.sensorData.deleteMany();
    await prisma.maintenanceTicket.deleteMany();
    await prisma.cropImage.deleteMany();
    await prisma.droneMission.deleteMany();
    await prisma.fieldRule.deleteMany();
    await prisma.device.deleteMany();
    await prisma.field.deleteMany();
    await prisma.farm.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();

    // 1. Création des Utilisateurs
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@phytera.com',
            password: hashedPassword,
            nom: 'Administrateur Systèmes',
            role: Role.ADMIN,
            preferences: { theme: 'dark', language: 'fr', emailAlerts: true },
        },
    });

    const agriculteur = await prisma.user.create({
        data: {
            email: 'm.helene@phytera.ag',
            password: hashedPassword,
            nom: 'Mama Hélène Kasangulu',
            role: Role.AGRICULTEUR,
            preferences: { theme: 'dark', language: 'fr', smsAlerts: true },
        },
    });

    const technicien = await prisma.user.create({
        data: {
            email: 'technicien@phytera.ag',
            password: hashedPassword,
            nom: 'Ing. Paul Mukendi',
            role: Role.TECHNICIEN,
            preferences: { theme: 'dark', language: 'fr' },
        },
    });

    console.log('✅ 3 Utilisateurs créés.');

    // 2. Création d'Abonnement
    await prisma.subscription.create({
        data: {
            userId: agriculteur.id,
            plan: SubscriptionPlan.PRO,
            limits: { maxFarms: 5, maxFields: 20, maxDevicesPerField: 5 },
        },
    });

    // 3. Création des Exploitations (Farms)
    const farm1 = await prisma.farm.create({
        data: {
            name: 'Domaine Agricole de Kasangulu',
            description: 'Exploitation vivrière maraîchère intelligente surveillée par IoT ESP32',
            location: 'Kasangulu, Bas-Congo, RDC',
            ownerId: agriculteur.id,
        },
    });

    const farm2 = await prisma.farm.create({
        data: {
            name: 'Agro-Parc de la Nsele',
            description: 'Culture céréalière expérimentale guidée par drones et IA agronomique',
            location: 'Commune de la Nsele, Kinshasa, RDC',
            ownerId: agriculteur.id,
        },
    });

    console.log('✅ 2 Exploitations créées.');

    // 4. Création des Parcelles (Fields)
    const field1 = await prisma.field.create({
        data: {
            name: 'Parcelle Maïs Doux - Zone Nord A1',
            description: 'Superficie cultivée en Maïs hybride avec irrigation goutte-à-goutte automatisée',
            farmId: farm1.id,
            cultureType: 'MAIS',
            variety: 'Zea mays L.',
            surfaceArea: 350,
            locationPolygon: {
                type: 'Polygon',
                coordinates: [
                    [
                        [15.312, -4.325],
                        [15.315, -4.325],
                        [15.315, -4.328],
                        [15.312, -4.328],
                        [15.312, -4.325],
                    ],
                ],
            },
        },
    });

    const field2 = await prisma.field.create({
        data: {
            name: 'Parcelle Tomate Roma - Serre 2',
            description: 'Culture maraîchère sous serre avec suivi d\'humidité sol et NPK',
            farmId: farm1.id,
            cultureType: 'TOMATE',
            variety: 'Solanum lycopersicum',
            surfaceArea: 180,
        },
    });

    const field3 = await prisma.field.create({
        data: {
            name: 'Parcelle Manioc Amélioré - Nsele B3',
            description: 'Zone d\'expérimentation manioc résistant à la mosaïque',
            farmId: farm2.id,
            cultureType: 'MANIOC',
            variety: 'Manihot esculenta',
            surfaceArea: 500,
        },
    });

    console.log('✅ 3 Parcelles créées.');

    // 5. Création des Appareils ESP32 (Devices)
    const device1 = await prisma.device.create({
        data: {
            deviceKey: 'DEV-ESP32-001-KAS',
            serialNumber: 'SN-ESP32-2026-001',
            fieldId: field1.id,
            deviceType: 'ESP32_PHYTERA_NODE',
            firmwareVersion: 'v2.1.0-release',
            status: DeviceStatus.ACTIVE,
            lastSeen: new Date(),
        },
    });

    const device2 = await prisma.device.create({
        data: {
            deviceKey: 'DEV-ESP32-002-TOM',
            serialNumber: 'SN-ESP32-2026-002',
            fieldId: field2.id,
            deviceType: 'ESP32_CAM_DIAGNOSIS',
            firmwareVersion: 'v2.1.0-release',
            status: DeviceStatus.ACTIVE,
            lastSeen: new Date(),
        },
    });

    console.log('✅ 2 Boîtiers IoT ESP32 enregistrés.');

    // 6. Données de Télémesure (SensorData)
    const now = Date.now();
    for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now - i * 3600 * 1000);
        await prisma.sensorData.create({
            data: {
                clientUuid: `uuid-telemetry-f1-${i}-${Date.now()}`,
                deviceId: device1.id,
                fieldId: field1.id,
                timestamp: timestamp,
                tempAir: 27.5 + Math.sin(i) * 2,
                humAir: 72 + Math.cos(i) * 5,
                tempSol: 24.2 + (i % 2),
                humSol: 45 + (i * 2),
                phSol: 6.7,
                luminosite: 14500 - i * 300,
            },
        });
    }

    console.log('✅ Données de télémesure insérées.');

    // 7. Alertes & Notifications
    const alert1 = await prisma.alert.create({
        data: {
            fieldId: field1.id,
            deviceId: device1.id,
            type: AlertType.HYDRIC_STRESS,
            level: AlertLevel.CRITICAL,
            title: 'Stress Hydrique Détecté sur Maïs',
            message: 'Le taux d\'humidité du sol est descendu à 32% (seuil critique: 40%). Risque d\'abaissement du rendement.',
            resolved: false,
        },
    });

    await prisma.notification.create({
        data: {
            userId: agriculteur.id,
            alertId: alert1.id,
            title: 'Alerte Critique : Irriguer la Parcelle Maïs A1',
            body: 'Action recommandée : Activer l\'irrigation automatisée pendant 45 minutes.',
            priority: NotificationPriority.CRITICAL,
            type: NotificationType.WEBSOCKET,
        },
    });

    console.log('✅ Alertes et notifications générées.');

    // 8. Diagnostics Images IA
    await prisma.cropImage.create({
        data: {
            fieldId: field2.id,
            userId: agriculteur.id,
            imageUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?q=80&w=1000&auto=format&fit=crop',
            source: 'SMARTPHONE',
            aiDiagnosis: 'Sain (Feuillage vigoureux sans sporulation de mildiou)',
            confidenceScore: 0.96,
            status: CropImageStatus.ANALYZED,
        },
    });

    // 9. Survol Drone
    await prisma.droneMission.create({
        data: {
            fieldId: field1.id,
            pilotName: 'Ing. Paul Mukendi',
            status: MissionStatus.COMPLETED,
            ndviMapUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
        },
    });

    // 10. Ticket de Maintenance Technicien
    await prisma.maintenanceTicket.create({
        data: {
            deviceId: device2.id,
            technicianId: technicien.id,
            status: TicketStatus.OPEN,
            title: 'Remplacement batterie panneau solaire ESP32',
            issueDescription: 'La tension batterie oscille sous 3.2V lors des transmissions nocturnes.',
        },
    });

    console.log('🚀 Peuplement de la base de données PostgreSQL terminé avec succès !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

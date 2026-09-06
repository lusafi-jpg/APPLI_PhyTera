// PhyTera Persistent Mock Storage for Offline & Demo Mode
// Allows smooth usage on Vercel deployment without requiring an active local NestJS backend

const STORAGE_KEYS = {
    FARMS: 'phytera_farms_data',
    DEVICES: 'phytera_devices_data',
    MISSIONS: 'phytera_missions_data',
    TICKETS: 'phytera_tickets_data',
    ALERTS: 'phytera_alerts_data',
};

export const DEFAULT_FARMS = [
    {
        id: 'farm-1',
        name: 'Domaine Agro-Tech Maluku',
        location: 'Maluku, Kinshasa, RDC',
        description: 'Exploitation pilote intégrant capteurs IoT, maraîchage sous serre et maïs hybride.',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        fields: [
            {
                id: 'field-1',
                farmId: 'farm-1',
                name: 'Champ Nord - Maïs Hybride',
                cultureType: 'Maïs',
                variety: 'Pioneer P3406',
                surfaceArea: 4.5,
                status: 'HEALTHY',
                locationPolygon: {
                    type: 'Polygon',
                    coordinates: [[
                        [15.310, -4.320],
                        [15.318, -4.320],
                        [15.318, -4.328],
                        [15.310, -4.328],
                        [15.310, -4.320],
                    ]],
                },
            },
            {
                id: 'field-2',
                farmId: 'farm-1',
                name: 'Champ Sud - Manioc & Maraîchage',
                cultureType: 'Manioc',
                variety: 'Sawasa',
                surfaceArea: 2.8,
                status: 'WARNING',
                locationPolygon: {
                    type: 'Polygon',
                    coordinates: [[
                        [15.320, -4.325],
                        [15.328, -4.325],
                        [15.328, -4.333],
                        [15.320, -4.333],
                        [15.320, -4.325],
                    ]],
                },
            },
        ],
    },
    {
        id: 'farm-2',
        name: 'Vallée Verte Kasangulu',
        location: 'Kasangulu, Kongo Central, RDC',
        description: 'Cultures vivrières et vergers sous irrigation automatisée et surveillance par drone.',
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        fields: [
            {
                id: 'field-3',
                farmId: 'farm-2',
                name: 'Champ Est - Verger d\'Agrumes',
                cultureType: 'Agrumes',
                variety: 'Valencia Late',
                surfaceArea: 6.2,
                status: 'HEALTHY',
                locationPolygon: {
                    type: 'Polygon',
                    coordinates: [[
                        [15.295, -4.335],
                        [15.305, -4.335],
                        [15.305, -4.342],
                        [15.295, -4.342],
                        [15.295, -4.335],
                    ]],
                },
            },
        ],
    },
];

export const DEFAULT_DEVICES = [
    {
        id: 'dev-1',
        serialNumber: 'ESP32-PHY-001',
        deviceKey: 'dk_live_938210398',
        status: 'ACTIVE',
        deviceType: 'ESP32_PHYTERA',
        firmwareVersion: '1.0.4',
        fieldId: 'field-1',
        field: { name: 'Champ Nord - Maïs Hybride' },
        lastSeen: new Date().toISOString(),
        metadata: {
            wifiSsid: 'PhyTera_Maluku_ZoneA',
            wifiIp: '192.168.1.105',
            wifiSignal: -58,
            battery: 88,
            temperature: 28.4,
            humidity: 65,
        },
    },
    {
        id: 'dev-2',
        serialNumber: 'ESP32-PHY-002',
        deviceKey: 'dk_live_483920182',
        status: 'ACTIVE',
        deviceType: 'ESP32_PHYTERA',
        firmwareVersion: '1.0.4',
        fieldId: 'field-2',
        field: { name: 'Champ Sud - Manioc' },
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
        metadata: {
            wifiSsid: 'PhyTera_Maluku_ZoneB',
            wifiIp: '192.168.1.106',
            wifiSignal: -64,
            battery: 74,
            temperature: 29.1,
            humidity: 58,
        },
    },
];

export const mockStorage = {
    // --- FARMS ---
    getFarms() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.FARMS);
            if (!raw) {
                this.setFarms(DEFAULT_FARMS);
                return DEFAULT_FARMS;
            }
            return JSON.parse(raw);
        } catch (e) {
            return DEFAULT_FARMS;
        }
    },

    setFarms(farms) {
        try {
            localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(farms));
        } catch (e) {
            console.error('Failed to save farms to localStorage', e);
        }
    },

    getFarmById(id) {
        const farms = this.getFarms();
        return farms.find((f) => f.id === id) || null;
    },

    addFarm(farm) {
        const farms = this.getFarms();
        const created = {
            id: farm.id || 'farm-' + Date.now(),
            name: farm.name,
            location: farm.location || '',
            description: farm.description || '',
            fields: farm.fields || [],
            createdAt: farm.createdAt || new Date().toISOString(),
            isLocal: true,
        };
        const updated = [created, ...farms];
        this.setFarms(updated);
        return created;
    },

    updateFarm(id, data) {
        const farms = this.getFarms();
        const index = farms.findIndex((f) => f.id === id);
        if (index >= 0) {
            farms[index] = { ...farms[index], ...data, updatedAt: new Date().toISOString() };
            this.setFarms(farms);
            return farms[index];
        }
        return null;
    },

    deleteFarm(id) {
        const farms = this.getFarms();
        const filtered = farms.filter((f) => f.id !== id);
        this.setFarms(filtered);
        return { success: true };
    },

    // --- FIELDS (CHAMPS / PARCELLES) ---
    getFields(farmId = null) {
        const farms = this.getFarms();
        const allFields = farms.flatMap((f) =>
            (f.fields || []).map((field) => ({
                ...field,
                farmId: f.id,
                farmName: f.name,
                farmLocation: f.location,
            }))
        );
        if (farmId) {
            return allFields.filter((field) => field.farmId === farmId);
        }
        return allFields;
    },

    getFieldById(id) {
        const fields = this.getFields();
        return fields.find((field) => field.id === id) || null;
    },

    addField(fieldData) {
        const farms = this.getFarms();
        const targetFarmId = fieldData.farmId || (farms.length > 0 ? farms[0].id : null);
        if (!targetFarmId) {
            // If no farm exists, create a default farm first
            const newDefaultFarm = this.addFarm({
                name: 'Exploitation Principale',
                location: 'Kinshasa, RDC',
                description: 'Créée automatiquement pour accueillir vos champs.',
            });
            return this.addField({ ...fieldData, farmId: newDefaultFarm.id });
        }

        const newField = {
            id: fieldData.id || 'field-' + Date.now(),
            farmId: targetFarmId,
            name: fieldData.name,
            cultureType: fieldData.cultureType || 'Culture Vivrière',
            variety: fieldData.variety || 'Standard',
            surfaceArea: Number(fieldData.surfaceArea) || 1.0,
            status: fieldData.status || 'HEALTHY',
            locationPolygon: fieldData.locationPolygon || {
                type: 'Polygon',
                coordinates: [[
                    [15.300 + (Math.random() * 0.02), -4.320 - (Math.random() * 0.02)],
                    [15.308 + (Math.random() * 0.02), -4.320 - (Math.random() * 0.02)],
                    [15.308 + (Math.random() * 0.02), -4.328 - (Math.random() * 0.02)],
                    [15.300 + (Math.random() * 0.02), -4.328 - (Math.random() * 0.02)],
                    [15.300 + (Math.random() * 0.02), -4.320 - (Math.random() * 0.02)],
                ]],
            },
            createdAt: new Date().toISOString(),
            isLocal: true,
        };

        const updatedFarms = farms.map((farm) => {
            if (farm.id === targetFarmId) {
                return {
                    ...farm,
                    fields: [...(farm.fields || []), newField],
                };
            }
            return farm;
        });

        this.setFarms(updatedFarms);
        return newField;
    },

    deleteField(fieldId) {
        const farms = this.getFarms();
        const updatedFarms = farms.map((farm) => ({
            ...farm,
            fields: (farm.fields || []).filter((f) => f.id !== fieldId),
        }));
        this.setFarms(updatedFarms);
        return { success: true };
    },

    // --- DEVICES ---
    getDevices() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.DEVICES);
            if (!raw) {
                this.setDevices(DEFAULT_DEVICES);
                return DEFAULT_DEVICES;
            }
            return JSON.parse(raw);
        } catch (e) {
            return DEFAULT_DEVICES;
        }
    },

    setDevices(devices) {
        try {
            localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
        } catch (e) {
            console.error('Failed to save devices to localStorage', e);
        }
    },

    addDevice(deviceData) {
        const devices = this.getDevices();
        const fields = this.getFields();
        const targetField = fields.find((f) => f.id === deviceData.fieldId) || { name: 'Parcelle Principale' };

        const newDevice = {
            id: 'dev-' + Date.now(),
            serialNumber: deviceData.serialNumber,
            deviceKey: 'dk_live_' + Math.random().toString(36).substring(2, 11),
            status: 'ACTIVE',
            deviceType: deviceData.deviceType || 'ESP32_PHYTERA',
            firmwareVersion: deviceData.firmwareVersion || '1.0.0',
            fieldId: deviceData.fieldId,
            field: { name: targetField.name },
            lastSeen: new Date().toISOString(),
            metadata: {
                wifiSsid: 'PhyTera_Farm_WiFi',
                wifiIp: '192.168.1.107',
                wifiSignal: -55,
                battery: 100,
                temperature: 27.5,
                humidity: 62,
            },
            isLocal: true,
        };

        const updated = [newDevice, ...devices];
        this.setDevices(updated);
        return newDevice;
    },

    updateDevice(id, data) {
        const devices = this.getDevices();
        const index = devices.findIndex((d) => d.id === id);
        if (index >= 0) {
            devices[index] = { ...devices[index], ...data };
            this.setDevices(devices);
            return devices[index];
        }
        return null;
    },

    deleteDevice(id) {
        const devices = this.getDevices();
        const filtered = devices.filter((d) => d.id !== id);
        this.setDevices(filtered);
        return { success: true };
    },

    // --- MISSIONS DRONE ---
    getMissions(fieldId = null) {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.MISSIONS);
            const missions = raw ? JSON.parse(raw) : [
                {
                    id: 'mis-1',
                    fieldId: 'field-1',
                    flightDate: new Date().toISOString(),
                    pilotName: 'Capitaine Agro-Drone',
                    ndviMapUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
                    thermalMapUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=800&auto=format&fit=crop',
                    status: 'COMPLETED',
                    avgNdvi: 0.78,
                    stressDetected: false,
                },
            ];
            if (fieldId) {
                return missions.filter((m) => m.fieldId === fieldId);
            }
            return missions;
        } catch (e) {
            return [];
        }
    },

    addMission(missionData) {
        const missions = this.getMissions();
        const newMission = {
            id: 'mis-' + Date.now(),
            fieldId: missionData.fieldId,
            flightDate: missionData.flightDate || new Date().toISOString(),
            pilotName: missionData.pilotName || 'Capitaine Agro-Drone',
            ndviMapUrl: missionData.ndviMapUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
            thermalMapUrl: missionData.thermalMapUrl || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=800&auto=format&fit=crop',
            status: 'COMPLETED',
            avgNdvi: 0.74,
            stressDetected: false,
            isLocal: true,
        };
        const updated = [newMission, ...missions];
        try {
            localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(updated));
        } catch (e) { }
        return newMission;
    },

    // --- TICKETS MAINTENANCE ---
    getTickets() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
            return raw ? JSON.parse(raw) : [
                {
                    id: 'tkt-1',
                    deviceId: 'dev-1',
                    title: 'Étalonnage capteur humidité du sol',
                    issueDescription: 'Dérive de calibration détectée après forte pluie.',
                    interventionDate: new Date().toISOString().split('T')[0],
                    status: 'IN_PROGRESS',
                    priority: 'MEDIUM',
                },
            ];
        } catch (e) {
            return [];
        }
    },

    addTicket(ticketData) {
        const tickets = this.getTickets();
        const newTicket = {
            id: 'tkt-' + Date.now(),
            ...ticketData,
            status: 'PENDING',
            priority: ticketData.priority || 'MEDIUM',
            createdAt: new Date().toISOString(),
            isLocal: true,
        };
        const updated = [newTicket, ...tickets];
        try {
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
        } catch (e) { }
        return newTicket;
    },
};

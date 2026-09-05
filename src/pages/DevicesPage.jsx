import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, Battery, Signal, Plus, QrCode, X, Search, RefreshCw, Key, Trash2 } from 'lucide-react';
import { devicesService } from '../services/devicesService';
import { fieldsService } from '../services/fieldsService';

const DevicesPage = () => {
    const [devices, setDevices] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [newDevice, setNewDevice] = useState({
        serialNumber: '',
        fieldId: '',
        deviceType: 'ESP32_PHYTERA',
        firmwareVersion: '1.0.0',
    });

    const fetchDevicesAndFields = async () => {
        setLoading(true);
        try {
            const [fetchedDevices, fetchedFields] = await Promise.all([
                devicesService.getAllDevices(),
                fieldsService.getFields(),
            ]);
            setDevices(Array.isArray(fetchedDevices) ? fetchedDevices : []);
            const fieldList = Array.isArray(fetchedFields) ? fetchedFields : [];
            setFields(fieldList);
            if (fieldList.length > 0) {
                setNewDevice((prev) => ({ ...prev, fieldId: fieldList[0].id }));
            }
        } catch (err) {
            console.warn('Backend devices endpoint unavailable, using demo list.');
            setDevices([
                {
                    id: 'dev-1',
                    serialNumber: 'ESP32-PHY-001',
                    deviceKey: 'dk_live_938210398',
                    status: 'ACTIVE',
                    deviceType: 'ESP32_PHYTERA',
                    field: { name: 'Parcelle Nord' },
                    lastSeen: new Date().toISOString(),
                },
                {
                    id: 'dev-2',
                    serialNumber: 'ESP32-PHY-002',
                    deviceKey: 'dk_live_483920182',
                    status: 'MAINTENANCE',
                    deviceType: 'ESP32_PHYTERA',
                    field: { name: 'Parcelle Est' },
                    lastSeen: new Date(Date.now() - 86400000).toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevicesAndFields();
    }, []);

    const handleRegisterDevice = async (e) => {
        e.preventDefault();
        if (!newDevice.serialNumber || !newDevice.fieldId) return;
        setSubmitting(true);
        try {
            await devicesService.registerDevice(newDevice);
            setIsModalOpen(false);
            setNewDevice({ serialNumber: '', fieldId: fields[0]?.id || '', deviceType: 'ESP32_PHYTERA', firmwareVersion: '1.0.0' });
            fetchDevicesAndFields();
        } catch (err) {
            alert(`Erreur enregistrement: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRotateKey = async (id) => {
        if (!confirm('Régénérer la clé unique (x-device-key) pour ce boîtier ?')) return;
        try {
            const res = await devicesService.rotateDeviceKey(id);
            alert(`Nouvelle clé générée avec succès: ${res?.deviceKey || 'Clé mise à jour'}`);
            fetchDevicesAndFields();
        } catch (err) {
            alert(`Erreur régénération: ${err.message}`);
        }
    };

    const handleDeleteDevice = async (id) => {
        if (!confirm('Désassocier et supprimer ce boîtier ?')) return;
        try {
            await devicesService.removeDevice(id);
            fetchDevicesAndFields();
        } catch (err) {
            alert(`Erreur suppression: ${err.message}`);
        }
    };

    const filteredDevices = devices.filter(
        (d) =>
            d.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.field?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <Cpu className="w-8 h-8 text-neon-blue" /> Parc Appareils ESP32 (IoT)
                    </h2>
                    <p className="text-gray-400 text-sm">Total: {devices.length} boîtier(s) enregistrés au backend NestJS</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher Série ou Parcelle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-navy-800 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neon-blue"
                        />
                    </div>
                    <button
                        onClick={fetchDevicesAndFields}
                        className="p-2 bg-navy-800 border border-white/10 rounded-xl hover:text-neon-blue transition text-gray-300"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 transition-all text-sm"
                    >
                        <Plus size={18} />
                        <span>Enregistrer Boîtier</span>
                    </button>
                </div>
            </div>

            {/* Devices Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-48 rounded-2xl bg-navy-900/50 border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDevices.map((device) => (
                        <div
                            key={device.id}
                            className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-neon-blue/40 transition-all group bg-navy-900/60 backdrop-blur-xl relative"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-3 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue">
                                    <Cpu size={24} />
                                </div>
                                <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${device.status === 'ACTIVE'
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        }`}
                                >
                                    {device.status}
                                </span>
                            </div>

                            <h3 className="text-white font-bold text-base">{device.serialNumber}</h3>
                            <p className="text-gray-400 text-xs mt-0.5">
                                Type: {device.deviceType} • {device.field?.name || 'Parcelle associée'}
                            </p>

                            <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs">
                                <div className="flex justify-between text-gray-400 font-mono">
                                    <span>Clé IoT:</span>
                                    <span className="text-neon-cyan truncate max-w-[150px]">{device.deviceKey || 'x-device-key'}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Dernier vu:</span>
                                    <span>{device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString('fr-FR') : 'En ligne'}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                <button
                                    onClick={() => handleRotateKey(device.id)}
                                    className="text-xs text-neon-blue hover:text-neon-cyan flex items-center gap-1 font-semibold"
                                    title="Régénérer clé x-device-key"
                                >
                                    <Key size={14} /> Clé
                                </button>
                                <button
                                    onClick={() => handleDeleteDevice(device.id)}
                                    className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1"
                                >
                                    <Trash2 size={14} /> Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Device Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Cpu className="text-neon-blue" size={20} />
                            Enregistrer un boîtier ESP32
                        </h3>
                        <form onSubmit={handleRegisterDevice} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Numéro de Série *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: ESP32-PHY-003"
                                    value={newDevice.serialNumber}
                                    onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Parcelle d'installation *</label>
                                <select
                                    value={newDevice.fieldId}
                                    onChange={(e) => setNewDevice({ ...newDevice, fieldId: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                >
                                    {fields.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Type d'équipement</label>
                                <input
                                    type="text"
                                    value={newDevice.deviceType}
                                    onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-navy-800 text-gray-300 hover:text-white text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold hover:shadow-lg transition-all text-sm"
                                >
                                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevicesPage;

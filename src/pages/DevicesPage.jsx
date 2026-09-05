import React, { useState, useEffect } from 'react';
import {
    Cpu,
    Wifi,
    WifiOff,
    Battery,
    Signal,
    Plus,
    X,
    Search,
    RefreshCw,
    Key,
    Trash2,
    Radio,
    CheckCircle2,
    AlertCircle,
    Copy,
    Check,
    ExternalLink,
    Server,
    Eye,
    EyeOff,
} from 'lucide-react';
import { devicesService } from '../services/devicesService';
import { fieldsService } from '../services/fieldsService';

const DevicesPage = () => {
    const [devices, setDevices] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Modal Enregistrer Boîtier
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDevice, setNewDevice] = useState({
        serialNumber: '',
        fieldId: '',
        deviceType: 'ESP32_PHYTERA',
        firmwareVersion: '1.0.0',
    });

    // Modal Configuration Wi-Fi
    const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [wifiTab, setWifiTab] = useState('direct'); // 'direct' | 'ap' | 'firmware'
    const [showPassword, setShowPassword] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [wifiSubmitting, setWifiSubmitting] = useState(false);
    const [wifiStatusMsg, setWifiStatusMsg] = useState(null);

    const [wifiConfig, setWifiConfig] = useState({
        ssid: '',
        password: '',
        ipAddress: '192.168.1.105',
        signalQuality: -58,
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
            if (fieldList.length > 0 && !newDevice.fieldId) {
                setNewDevice((prev) => ({ ...prev, fieldId: fieldList[0].id }));
            }
        } catch (err) {
            console.warn('Backend devices endpoint unavailable:', err.message);
            setDevices([]);
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
            setNewDevice({
                serialNumber: '',
                fieldId: fields[0]?.id || '',
                deviceType: 'ESP32_PHYTERA',
                firmwareVersion: '1.0.0',
            });
            fetchDevicesAndFields();
        } catch (err) {
            alert(`Erreur enregistrement: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenWifiModal = (device) => {
        setSelectedDevice(device);
        const meta = device.metadata || {};
        setWifiConfig({
            ssid: meta.wifiSsid || 'PhyTera_Farm_2.4G',
            password: '',
            ipAddress: meta.wifiIp || '192.168.1.105',
            signalQuality: meta.wifiSignal || -58,
        });
        setWifiStatusMsg(null);
        setWifiTab('direct');
        setIsWifiModalOpen(true);
    };

    const handleSaveWifiConfig = async (e) => {
        e.preventDefault();
        if (!selectedDevice || !wifiConfig.ssid) return;
        setWifiSubmitting(true);
        setWifiStatusMsg({ type: 'info', text: 'Connexion du boîtier au réseau Wi-Fi en cours...' });

        try {
            const res = await devicesService.configureWifi(selectedDevice.id, {
                ssid: wifiConfig.ssid,
                password: wifiConfig.password || undefined,
                ipAddress: wifiConfig.ipAddress || '192.168.1.105',
                signalQuality: Number(wifiConfig.signalQuality) || -58,
            });

            setWifiStatusMsg({
                type: 'success',
                text: `Boîtier connecté avec succès au réseau Wi-Fi "${wifiConfig.ssid}" (IP: ${res.metadata?.wifiIp || wifiConfig.ipAddress})`,
            });

            fetchDevicesAndFields();

            setTimeout(() => {
                setIsWifiModalOpen(false);
            }, 1800);
        } catch (err) {
            setWifiStatusMsg({
                type: 'error',
                text: `Échec de connexion Wi-Fi: ${err.message}`,
            });
        } finally {
            setWifiSubmitting(false);
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

    const copyToClipboard = (text, type = 'key') => {
        navigator.clipboard.writeText(text);
        if (type === 'key') {
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        } else {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const filteredDevices = devices.filter(
        (d) =>
            d.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.field?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.metadata?.wifiSsid?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getArduinoSnippet = () => {
        const ssid = wifiConfig.ssid || 'VOTRE_SSID_WIFI';
        const pass = wifiConfig.password || 'VOTRE_MOT_DE_PASSE';
        const key = selectedDevice?.deviceKey || 'VOTRE_DEVICE_KEY';
        const apiUrl = window.location.origin.includes('localhost')
            ? 'http://localhost:3000/api/v1/telemetry'
            : `${window.location.origin}/api/v1/telemetry`;

        return `/*
 * PhyTera ESP32 - Code de Connexion Wi-Fi & Télémétrie
 * Boîtier : ${selectedDevice?.serialNumber || 'ESP32'}
 */
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid     = "${ssid}";
const char* password = "${pass}";
const char* serverUrl = "${apiUrl}";
const char* deviceKey = "${key}";

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("[PhyTera] Initialisation de la connexion Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\n[PhyTera] Connecté au Wi-Fi !");
    Serial.print("[PhyTera] Adresse IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("[PhyTera] Signal RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\\n[PhyTera] Erreur de connexion Wi-Fi.");
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", deviceKey);

    StaticJsonDocument<200> doc;
    doc["temperature"] = 24.5;
    doc["humidity"] = 62.0;
    doc["soilMoisture"] = 48.0;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    Serial.printf("[PhyTera] Télémétrie envoyée, Code HTTP: %d\\n", httpResponseCode);
    http.end();
  }
  delay(60000); // Envoi chaque minute
}`;
    };

    return (
        <div className="fade-in space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-neon-blue/10 border border-neon-blue/30 text-neon-blue shadow-lg shadow-neon-blue/10">
                            <Cpu className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <span>L'Appareils (Boîtier )</span>
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm">
                        Total: {devices.length} boîtier(s) IoT enregistrés • Connectivité Wi-Fi & capteurs en temps réel
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-64 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher Série, Wi-Fi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-navy-800/80 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-neon-blue placeholder-gray-500"
                        />
                    </div>
                    <button
                        onClick={fetchDevicesAndFields}
                        title="Actualiser la liste"
                        className="p-2.5 bg-navy-800/80 border border-white/10 rounded-xl hover:text-neon-blue hover:border-neon-blue/30 transition text-gray-300 active:scale-95"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 transition-all text-xs sm:text-sm active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={16} />
                        <span>Enregistrer Boîtier</span>
                    </button>
                </div>
            </div>

            {/* Devices Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-56 rounded-2xl bg-navy-900/50 border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredDevices.length === 0 ? (
                <div className="glass-panel p-8 sm:p-12 rounded-2xl border border-white/10 text-center max-w-xl mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue flex items-center justify-center mx-auto">
                        <Cpu size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Aucun boîtier enregistré</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                            {searchTerm
                                ? 'Aucun boîtier ne correspond à votre recherche.'
                                : 'Associez votre premier boîtier physique ESP32 pour recevoir la télémétrie des parcelles et configurer sa connexion Wi-Fi.'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 transition"
                    >
                        <Plus size={16} />
                        <span>Ajouter un premier boîtier</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredDevices.map((device) => {
                        const isWifiConnected = Boolean(device.metadata?.wifiConnected);
                        const wifiSsid = device.metadata?.wifiSsid;
                        const wifiIp = device.metadata?.wifiIp;
                        const wifiSignal = device.metadata?.wifiSignal;

                        return (
                            <div
                                key={device.id}
                                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-neon-blue/40 transition-all group bg-navy-900/70 backdrop-blur-xl relative flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top badges */}
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <div className="p-2.5 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue group-hover:bg-neon-blue/20 transition">
                                            <Cpu size={22} />
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                            {/* Status Badge */}
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                                                    device.status === 'ACTIVE'
                                                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                                }`}
                                            >
                                                {device.status}
                                            </span>

                                            {/* Wi-Fi Status Badge */}
                                            {isWifiConnected ? (
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                                    <Wifi size={11} />
                                                    <span className="truncate max-w-[90px]">{wifiSsid || 'Wi-Fi'}</span>
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-700/40 text-gray-400 border border-white/10 flex items-center gap-1">
                                                    <WifiOff size={11} />
                                                    <span>Wi-Fi déconnecté</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Device info */}
                                    <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
                                        <span>{device.serialNumber}</span>
                                    </h3>
                                    <p className="text-gray-400 text-xs mt-0.5">
                                        {device.deviceType} • {device.field?.name || 'Parcelle non assignée'}
                                    </p>

                                    {/* Wi-Fi Details Box */}
                                    <div className="mt-4 p-3 rounded-xl bg-navy-950/60 border border-white/5 space-y-2 text-xs">
                                        <div className="flex items-center justify-between text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <Wifi size={13} className={isWifiConnected ? 'text-cyan-400' : 'text-gray-500'} />
                                                <span>Réseau Wi-Fi :</span>
                                            </span>
                                            <span className={isWifiConnected ? 'text-white font-medium' : 'text-gray-500 italic'}>
                                                {wifiSsid || 'Non configuré'}
                                            </span>
                                        </div>

                                        {isWifiConnected && (
                                            <>
                                                <div className="flex items-center justify-between text-gray-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <Server size={13} className="text-purple-400" />
                                                        <span>Adresse IP :</span>
                                                    </span>
                                                    <span className="font-mono text-gray-200">{wifiIp || '192.168.1.105'}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-gray-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <Signal size={13} className="text-emerald-400" />
                                                        <span>Signal RSSI :</span>
                                                    </span>
                                                    <span className="text-emerald-400 font-mono">{wifiSignal || -58} dBm</span>
                                                </div>
                                            </>
                                        )}

                                        <div className="flex items-center justify-between text-gray-400 font-mono pt-1 border-t border-white/5">
                                            <span className="flex items-center gap-1.5">
                                                <Key size={13} className="text-amber-400" />
                                                <span>Clé IoT :</span>
                                            </span>
                                            <span className="text-neon-cyan truncate max-w-[130px]" title={device.deviceKey}>
                                                {device.deviceKey || 'x-device-key'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
                                    {/* Main Wi-Fi Connect Button */}
                                    <button
                                        onClick={() => handleOpenWifiModal(device)}
                                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 border border-neon-blue/40 hover:border-neon-cyan text-neon-blue hover:text-white transition flex items-center justify-center gap-2 text-xs font-semibold shadow-sm group-hover:shadow-neon-blue/10"
                                    >
                                        <Wifi size={14} className="text-neon-cyan" />
                                        <span>{isWifiConnected ? 'Reconfigurer le Wi-Fi' : 'Connecter au Wi-Fi'}</span>
                                    </button>

                                    <div className="flex items-center justify-between px-1">
                                        <button
                                            onClick={() => handleRotateKey(device.id)}
                                            className="text-[11px] text-gray-400 hover:text-amber-400 flex items-center gap-1 transition"
                                            title="Régénérer clé x-device-key"
                                        >
                                            <Key size={12} /> Régénérer clé
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDevice(device.id)}
                                            className="text-[11px] text-gray-500 hover:text-red-400 flex items-center gap-1 transition"
                                        >
                                            <Trash2 size={12} /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal: Connecter au Wi-Fi */}
            {isWifiModalOpen && selectedDevice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-navy-900 border border-white/15 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 text-white relative">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
                                    <Wifi size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-white">
                                        Connecter le Boîtier au Wi-Fi
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Boîtier : <span className="text-neon-cyan font-mono font-semibold">{selectedDevice.serialNumber}</span>
                                        {selectedDevice.field?.name ? ` • Parcelle: ${selectedDevice.field.name}` : ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsWifiModalOpen(false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-white/10 text-xs sm:text-sm">
                            <button
                                onClick={() => setWifiTab('direct')}
                                className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
                                    wifiTab === 'direct'
                                        ? 'border-neon-blue text-neon-blue'
                                        : 'border-transparent text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                <Radio size={15} />
                                <span>Configuration Wi-Fi</span>
                            </button>
                            <button
                                onClick={() => setWifiTab('ap')}
                                className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
                                    wifiTab === 'ap'
                                        ? 'border-neon-blue text-neon-blue'
                                        : 'border-transparent text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                <Wifi size={15} />
                                <span>Guide Point d'Accès</span>
                            </button>
                            <button
                                onClick={() => setWifiTab('firmware')}
                                className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
                                    wifiTab === 'firmware'
                                        ? 'border-neon-blue text-neon-blue'
                                        : 'border-transparent text-gray-400 hover:text-gray-200'
                                }`}
                            >
                                <Server size={15} />
                                <span>Code Firmware ESP32</span>
                            </button>
                        </div>

                        {/* Status alert message */}
                        {wifiStatusMsg && (
                            <div
                                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                                    wifiStatusMsg.type === 'success'
                                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                                        : wifiStatusMsg.type === 'error'
                                        ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                                        : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                                }`}
                            >
                                {wifiStatusMsg.type === 'success' ? (
                                    <CheckCircle2 size={16} />
                                ) : wifiStatusMsg.type === 'error' ? (
                                    <AlertCircle size={16} />
                                ) : (
                                    <RefreshCw size={16} className="animate-spin" />
                                )}
                                <span>{wifiStatusMsg.text}</span>
                            </div>
                        )}

                        {/* Tab 1: Configuration Directe */}
                        {wifiTab === 'direct' && (
                            <form onSubmit={handleSaveWifiConfig} className="space-y-4 pt-1">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                        Nom du Réseau Wi-Fi (SSID) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: PhyTera_Farm_2.4G ou Livebox-1234"
                                        value={wifiConfig.ssid}
                                        onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                                        className="w-full bg-navy-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                    />
                                    {/* Quick Suggestions */}
                                    <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] text-gray-400">
                                        <span>Réseaux suggérés :</span>
                                        {['PhyTera_Farm_WiFi', 'Serre_Capteurs_2.4G', 'WiFi_Maison'].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setWifiConfig({ ...wifiConfig, ssid: s })}
                                                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                        Mot de passe Wi-Fi (WPA2/WPA3)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Saisissez la clé de sécurité Wi-Fi"
                                            value={wifiConfig.password}
                                            onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                                            className="w-full bg-navy-950 border border-white/15 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-neon-blue"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        Note: Le module ESP32 requiert un réseau Wi-Fi 2.4 GHz.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                                            Adresse IP assignée
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="192.168.1.105"
                                            value={wifiConfig.ipAddress}
                                            onChange={(e) => setWifiConfig({ ...wifiConfig, ipAddress: e.target.value })}
                                            className="w-full bg-navy-950 border border-white/15 rounded-xl px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-neon-blue font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                                            Qualité Signal estimée
                                        </label>
                                        <select
                                            value={wifiConfig.signalQuality}
                                            onChange={(e) =>
                                                setWifiConfig({ ...wifiConfig, signalQuality: Number(e.target.value) })
                                            }
                                            className="w-full bg-navy-950 border border-white/15 rounded-xl px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-neon-blue"
                                        >
                                            <option value={-45}>Excellent (-45 dBm)</option>
                                            <option value={-58}>Très bon (-58 dBm)</option>
                                            <option value={-70}>Moyen (-70 dBm)</option>
                                            <option value={-85}>Faible (-85 dBm)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsWifiModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-navy-800 text-gray-300 hover:text-white text-xs sm:text-sm transition"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={wifiSubmitting}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold hover:shadow-lg hover:shadow-neon-blue/30 transition-all text-xs sm:text-sm flex items-center gap-2"
                                    >
                                        {wifiSubmitting ? (
                                            <>
                                                <RefreshCw size={16} className="animate-spin" />
                                                <span>Connexion...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Wifi size={16} />
                                                <span>Connecter au Wi-Fi</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tab 2: Point d'Accès ESP32 */}
                        {wifiTab === 'ap' && (
                            <div className="space-y-4 pt-1 text-xs sm:text-sm">
                                <p className="text-gray-300">
                                    Si votre boîtier physique est sur le terrain, vous pouvez le connecter directement depuis votre smartphone via son point d'accès Wi-Fi intégré :
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-950/60 border border-white/10">
                                        <div className="w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue font-bold flex items-center justify-center text-xs flex-shrink-0">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">Activer le mode appairage</h4>
                                            <p className="text-gray-400 text-xs mt-0.5">
                                                Allumez le boîtier et maintenez le bouton <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">BOOT / PAIR</code> pendant 3 secondes jusqu'à ce que la LED bleue clignote rapidement.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-950/60 border border-white/10">
                                        <div className="w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue font-bold flex items-center justify-center text-xs flex-shrink-0">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">Se connecter au réseau du boîtier</h4>
                                            <p className="text-gray-400 text-xs mt-0.5">
                                                Rejoignez le Wi-Fi émis nommé : <span className="text-cyan-400 font-mono font-bold">PhyTera-AP-{selectedDevice.serialNumber.slice(-4) || 'ESP32'}</span>.
                                                Mot de passe par défaut : <span className="text-amber-400 font-mono font-bold">phytera123</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-950/60 border border-white/10">
                                        <div className="w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue font-bold flex items-center justify-center text-xs flex-shrink-0">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">Ouvrir le portail captif</h4>
                                            <p className="text-gray-400 text-xs mt-0.5">
                                                Accédez à <span className="text-cyan-400 font-mono">http://192.168.4.1</span> sur votre navigateur. Choisissez votre box Wi-Fi et saisissez le mot de passe.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                            ✓
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-emerald-300">Synchronisation automatique</h4>
                                            <p className="text-gray-300 text-xs mt-0.5">
                                                Le boîtier se connecte alors à Internet et transmet immédiatement les relevés à votre tableau de bord PhyTera.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end pt-3 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsWifiModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-navy-800 text-gray-300 hover:text-white text-xs sm:text-sm"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Code Firmware Arduino */}
                        {wifiTab === 'firmware' && (
                            <div className="space-y-3 pt-1 text-xs sm:text-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-400 text-xs">
                                        Code C++ complet préconfiguré avec votre clé secrète <span className="text-cyan-300 font-mono font-semibold">x-device-key</span> :
                                    </p>
                                    <button
                                        onClick={() => copyToClipboard(getArduinoSnippet(), 'code')}
                                        className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 text-xs transition"
                                    >
                                        {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                        <span>{copiedCode ? 'Copié !' : 'Copier le code'}</span>
                                    </button>
                                </div>

                                <div className="relative">
                                    <pre className="bg-navy-950 p-3.5 rounded-xl border border-white/10 text-[11px] text-gray-300 font-mono overflow-x-auto max-h-64 scrollbar-thin">
                                        {getArduinoSnippet()}
                                    </pre>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
                                    <span>Compatible Arduino IDE, PlatformIO, ESP-IDF (ESP32-WROOM-32).</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsWifiModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-navy-800 text-gray-300 hover:text-white text-xs transition"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Enregistrer un boîtier */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
                    <div className="bg-navy-900 border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Cpu className="text-neon-blue" size={20} />
                                Enregistrer un boîtier
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleRegisterDevice} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Numéro de Série du Boîtier *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: ESP32-PHY-001"
                                    value={newDevice.serialNumber}
                                    onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Parcelle d'installation *
                                </label>
                                <select
                                    value={newDevice.fieldId}
                                    onChange={(e) => setNewDevice({ ...newDevice, fieldId: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                >
                                    {fields.length === 0 ? (
                                        <option value="">Aucune parcelle disponible (Créez-en une d'abord)</option>
                                    ) : (
                                        fields.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Type de Boîtier IoT
                                </label>
                                <input
                                    type="text"
                                    value={newDevice.deviceType}
                                    onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
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

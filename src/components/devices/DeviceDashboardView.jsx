import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    Wifi,
    WifiOff,
    Cpu,
    RefreshCw,
    Download,
    Zap,
    Thermometer,
    Droplets,
    Sprout,
    Sun,
    Activity,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Search,
    Layers,
    Server,
    Settings,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { telemetryService } from '../../services/telemetryService';

const DeviceDashboardView = ({ device, onBack, onOpenWifiModal }) => {
    const [telemetry, setTelemetry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acquiring, setAcquiring] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isWifiConnected = Boolean(device.metadata?.wifiConnected || device.metadata?.wifiSsid);
    const wifiSsid = device.metadata?.wifiSsid;
    const wifiIp = device.metadata?.wifiIp;
    const wifiSignal = device.metadata?.wifiSignal;

    const fetchTelemetry = async () => {
        setLoading(true);
        try {
            const data = await telemetryService.getDeviceTelemetry(device.id, 100);
            setTelemetry(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur chargement télémétrie:', err);
            setTelemetry([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (device?.id) {
            fetchTelemetry();
        }
    }, [device?.id]);

    const handleAcquire = async () => {
        setAcquiring(true);
        setNotification({ type: 'info', message: 'Acquisition des capteurs en cours via la liaison Wi-Fi...' });
        try {
            const newMeasure = await telemetryService.acquireDeviceTelemetry(device.id);
            setTelemetry((prev) => [newMeasure, ...prev]);
            setNotification({
                type: 'success',
                message: `Donnée acquise avec succès à ${new Date(newMeasure.timestamp).toLocaleTimeString('fr-FR')} !`,
            });
            setTimeout(() => setNotification(null), 4000);
        } catch (err) {
            setNotification({ type: 'error', message: `Erreur lors de l'acquisition : ${err.message}` });
        } finally {
            setAcquiring(false);
        }
    };

    const handleExportCSV = () => {
        if (telemetry.length === 0) return;
        const headers = ['Date', 'Heure', 'Temp Air (°C)', 'Hum Air (%)', 'Temp Sol (°C)', 'Hum Sol (%)', 'pH Sol', 'Luminosité (Lux)'];
        const rows = telemetry.map((item) => {
            const d = new Date(item.timestamp);
            return [
                d.toLocaleDateString('fr-FR'),
                d.toLocaleTimeString('fr-FR'),
                item.tempAir ?? '',
                item.humAir ?? '',
                item.tempSol ?? '',
                item.humSol ?? '',
                item.phSol ?? '',
                item.luminosite ?? '',
            ];
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `telemetrie_${device.serialNumber}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const latest = telemetry[0] || null;

    // Format chart data (chronological)
    const chartData = [...telemetry]
        .reverse()
        .slice(-20)
        .map((item) => {
            const d = new Date(item.timestamp);
            return {
                time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                tempAir: item.tempAir,
                tempSol: item.tempSol,
                humAir: item.humAir,
                humSol: item.humSol,
                phSol: item.phSol,
                luminosite: item.luminosite,
            };
        });

    const filteredTelemetry = telemetry.filter((item) => {
        const str = `${item.tempAir} ${item.humAir} ${item.tempSol} ${item.humSol} ${item.phSol} ${new Date(item.timestamp).toLocaleString('fr-FR')}`.toLowerCase();
        return str.includes(searchTerm.toLowerCase());
    });

    const getAgronomicStatus = (item) => {
        if (!item) return { label: 'Inconnu', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
        // Check thresholds
        const tempBad = item.tempAir > 35 || item.tempAir < 10;
        const humBad = item.humSol < 30 || item.humSol > 85;
        const phBad = item.phSol < 5.5 || item.phSol > 8.0;

        if (tempBad || humBad || phBad) {
            return { label: 'Critique', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
        }
        if (item.tempAir > 30 || item.humSol < 40 || item.phSol < 6.0 || item.phSol > 7.5) {
            return { label: 'Vigilance', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        }
        return { label: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    };

    return (
        <div className="fade-in space-y-6">
            {/* Top Navigation & Boîtier Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition w-fit px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20"
                >
                    <ChevronLeft size={16} />
                    <span>Retour à la liste des boîtiers</span>
                </button>

                <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-navy-900/80 backdrop-blur-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="p-3 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 text-neon-blue">
                            <Cpu size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                                    {device.serialNumber}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neon-blue/10 text-neon-blue border border-neon-blue/30">
                                    {device.deviceType}
                                </span>
                                {device.field?.name && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                                        Parcelle : {device.field.name}
                                    </span>
                                )}
                            </div>

                            {/* Wi-Fi Status Bar */}
                            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-400">
                                {isWifiConnected ? (
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <Wifi size={13} />
                                        <span>Connecté au Wi-Fi : <strong className="text-white font-medium">{wifiSsid}</strong></span>
                                        {wifiIp && <span className="text-gray-400">({wifiIp})</span>}
                                        {wifiSignal && <span className="text-emerald-400 font-mono">{wifiSignal} dBm</span>}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                                        <WifiOff size={13} />
                                        <span>Wi-Fi non configuré</span>
                                    </div>
                                )}

                                <button
                                    onClick={() => onOpenWifiModal(device)}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2"
                                >
                                    <Settings size={12} />
                                    <span>Configurer Wi-Fi</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                        <button
                            onClick={handleAcquire}
                            disabled={acquiring}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-neon-blue/25 hover:shadow-neon-blue/40 transition active:scale-95 disabled:opacity-50"
                        >
                            <Zap size={16} className={acquiring ? 'animate-bounce text-navy-950' : 'text-navy-950 fill-navy-950'} />
                            <span>{acquiring ? 'Acquisition en cours...' : 'Acquérir des Données'}</span>
                        </button>

                        <button
                            onClick={fetchTelemetry}
                            disabled={loading}
                            title="Actualiser les données"
                            className="p-2.5 bg-navy-800 border border-white/10 rounded-xl hover:text-neon-blue hover:border-neon-blue/30 text-gray-300 transition active:scale-95"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            onClick={handleExportCSV}
                            disabled={telemetry.length === 0}
                            title="Exporter en fichier CSV"
                            className="px-3.5 py-2.5 bg-navy-800 border border-white/10 rounded-xl hover:text-white hover:border-white/20 text-gray-300 text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-40"
                        >
                            <Download size={15} />
                            <span className="hidden sm:inline">Export CSV</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            {notification && (
                <div
                    className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 transition ${
                        notification.type === 'success'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : notification.type === 'error'
                            ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                            : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                    }`}
                >
                    {notification.type === 'success' ? (
                        <CheckCircle2 size={18} />
                    ) : notification.type === 'error' ? (
                        <AlertTriangle size={18} />
                    ) : (
                        <RefreshCw size={18} className="animate-spin" />
                    )}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Live KPI Dashboard Cards */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Layers size={18} className="text-neon-cyan" />
                        <span>Dernières Données Acquises (Temps Réel)</span>
                    </h3>
                    {latest && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            <span>Dernier relevé : {new Date(latest.timestamp).toLocaleTimeString('fr-FR')}</span>
                        </span>
                    )}
                </div>

                {!latest ? (
                    <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-3 bg-navy-900/50">
                        <div className="w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue flex items-center justify-center mx-auto">
                            <Zap size={24} />
                        </div>
                        <h4 className="text-base font-bold text-white">Aucune donnée encore acquise pour ce boîtier</h4>
                        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                            Le boîtier est prêt. Cliquez sur le bouton ci-dessous pour déclencher la première acquisition de mesures capteurs.
                        </p>
                        <button
                            onClick={handleAcquire}
                            disabled={acquiring}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold text-xs shadow-lg shadow-neon-blue/20 transition hover:shadow-neon-blue/40"
                        >
                            <Zap size={14} />
                            <span>Lancer la Première Acquisition</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                        {/* 1. Temp Air */}
                        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-navy-900/60 hover:border-neon-cyan/40 transition">
                            <div className="flex justify-between items-center text-gray-400 mb-2">
                                <span className="text-xs font-semibold uppercase">Temp. Air</span>
                                <Thermometer size={16} className="text-amber-400" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                                {latest.tempAir !== null ? `${latest.tempAir} °C` : '--'}
                            </div>
                            <span className="text-[10px] text-emerald-400 mt-1 block">Optimal (18-28°C)</span>
                        </div>

                        {/* 2. Hum Air */}
                        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-navy-900/60 hover:border-neon-cyan/40 transition">
                            <div className="flex justify-between items-center text-gray-400 mb-2">
                                <span className="text-xs font-semibold uppercase">Hum. Air</span>
                                <Droplets size={16} className="text-cyan-400" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                                {latest.humAir !== null ? `${latest.humAir} %` : '--'}
                            </div>
                            <span className="text-[10px] text-cyan-400 mt-1 block">Normal (50-75%)</span>
                        </div>

                        {/* 3. Hum Sol */}
                        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-navy-900/60 hover:border-neon-cyan/40 transition">
                            <div className="flex justify-between items-center text-gray-400 mb-2">
                                <span className="text-xs font-semibold uppercase">Hum. Sol</span>
                                <Sprout size={16} className="text-emerald-400" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                                {latest.humSol !== null ? `${latest.humSol} %` : '--'}
                            </div>
                            <span className="text-[10px] text-emerald-400 mt-1 block">Bien irrigué</span>
                        </div>

                        {/* 4. Temp Sol */}
                        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-navy-900/60 hover:border-neon-cyan/40 transition">
                            <div className="flex justify-between items-center text-gray-400 mb-2">
                                <span className="text-xs font-semibold uppercase">Temp. Sol</span>
                                <Sun size={16} className="text-yellow-400" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                                {latest.tempSol !== null ? `${latest.tempSol} °C` : '--'}
                            </div>
                            <span className="text-[10px] text-yellow-400 mt-1 block">Favorable (18-24°C)</span>
                        </div>

                        {/* 5. pH Sol */}
                        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-navy-900/60 hover:border-neon-cyan/40 transition">
                            <div className="flex justify-between items-center text-gray-400 mb-2">
                                <span className="text-xs font-semibold uppercase">pH du Sol</span>
                                <Activity size={16} className="text-purple-400" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                                {latest.phSol !== null ? latest.phSol : '--'}
                            </div>
                            <span className="text-[10px] text-purple-400 mt-1 block">Neutre (6.0-7.0)</span>
                        </div>

                        {/* 6. Luminosité */}
                        <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-navy-900/60 hover:border-neon-cyan/40 transition">
                            <div className="flex justify-between items-center text-gray-400 mb-2">
                                <span className="text-xs font-semibold uppercase">Luminosité</span>
                                <Sun size={16} className="text-orange-400" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                                {latest.luminosite !== null ? `${Number(latest.luminosite).toLocaleString('fr-FR')} Lx` : '--'}
                            </div>
                            <span className="text-[10px] text-orange-400 mt-1 block">Plein soleil</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts Section */}
            {chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Chart 1: Températures */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-navy-900/60 space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <Thermometer size={16} className="text-neon-cyan" />
                                <span>Évolution des Températures (°C)</span>
                            </h4>
                            <span className="text-[11px] text-gray-400">Dernières acquisitions</span>
                        </div>
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTempAir" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTempSol" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FFB703" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#FFB703" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0a1128',
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                    <Area type="monotone" dataKey="tempAir" name="Temp. Air (°C)" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorTempAir)" />
                                    <Area type="monotone" dataKey="tempSol" name="Temp. Sol (°C)" stroke="#FFB703" strokeWidth={2} fillOpacity={1} fill="url(#colorTempSol)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 2: Humidités */}
                    <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-navy-900/60 space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <Droplets size={16} className="text-emerald-400" />
                                <span>Évolution des Humidités (%)</span>
                            </h4>
                            <span className="text-[11px] text-gray-400">Dernières acquisitions</span>
                        </div>
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorHumAir" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0096FF" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#0096FF" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorHumSol" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0a1128',
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                    <Area type="monotone" dataKey="humAir" name="Hum. Air (%)" stroke="#0096FF" strokeWidth={2} fillOpacity={1} fill="url(#colorHumAir)" />
                                    <Area type="monotone" dataKey="humSol" name="Hum. Sol (%)" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorHumSol)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Historique des Données Acquises Table */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 bg-navy-900/60 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <Clock size={18} className="text-neon-blue" />
                            <span>Historique des Données Acquises</span>
                        </h3>
                        <p className="text-xs text-gray-400">
                            Total : {telemetry.length} mesure(s) enregistrée(s) pour ce boîtier
                        </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input
                            type="text"
                            placeholder="Filtrer l'historique..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-navy-950 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-neon-blue"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-2 py-4">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-10 rounded-xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : filteredTelemetry.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs sm:text-sm">
                        Aucune mesure ne correspond à votre filtre.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                                    <th className="py-3 px-3">Date & Heure</th>
                                    <th className="py-3 px-2">Temp Air</th>
                                    <th className="py-3 px-2">Hum Air</th>
                                    <th className="py-3 px-2">Temp Sol</th>
                                    <th className="py-3 px-2">Hum Sol</th>
                                    <th className="py-3 px-2">pH Sol</th>
                                    <th className="py-3 px-2">Luminosité</th>
                                    <th className="py-3 px-3 text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredTelemetry.map((item) => {
                                    const status = getAgronomicStatus(item);
                                    const dateObj = new Date(item.timestamp);
                                    return (
                                        <tr key={item.id || item.clientUuid} className="hover:bg-white/5 transition">
                                            <td className="py-3 px-3 font-mono text-gray-300">
                                                <div className="font-semibold text-white">
                                                    {dateObj.toLocaleTimeString('fr-FR')}
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                    {dateObj.toLocaleDateString('fr-FR')}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 font-mono text-amber-300 font-medium">
                                                {item.tempAir !== null ? `${item.tempAir} °C` : '--'}
                                            </td>
                                            <td className="py-3 px-2 font-mono text-cyan-300 font-medium">
                                                {item.humAir !== null ? `${item.humAir} %` : '--'}
                                            </td>
                                            <td className="py-3 px-2 font-mono text-yellow-300 font-medium">
                                                {item.tempSol !== null ? `${item.tempSol} °C` : '--'}
                                            </td>
                                            <td className="py-3 px-2 font-mono text-emerald-300 font-medium">
                                                {item.humSol !== null ? `${item.humSol} %` : '--'}
                                            </td>
                                            <td className="py-3 px-2 font-mono text-purple-300 font-medium">
                                                {item.phSol !== null ? item.phSol : '--'}
                                            </td>
                                            <td className="py-3 px-2 font-mono text-gray-300">
                                                {item.luminosite !== null ? `${Number(item.luminosite).toLocaleString('fr-FR')} Lx` : '--'}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.color}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeviceDashboardView;

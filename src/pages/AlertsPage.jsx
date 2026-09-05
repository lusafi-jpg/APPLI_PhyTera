import React, { useState, useEffect } from 'react';
import { TriangleAlert, Info, CheckCircle, Search, Filter, BrainCircuit, Droplets, RefreshCw, ArrowLeft } from 'lucide-react';
import { alertsService } from '../services/alertsService';

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [resolving, setResolving] = useState(false);
    const [showMobileDetail, setShowMobileDetail] = useState(false);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const data = await alertsService.getAlerts();
            const list = Array.isArray(data) ? data : [];
            setAlerts(list);
            if (list.length > 0) setSelectedAlert(list[0]);
        } catch (err) {
            console.warn('Backend alerts unavailable:', err.message);
            setAlerts([]);
            setSelectedAlert(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleResolveAlert = async (id) => {
        const note = prompt('Note de résolution:');
        setResolving(true);
        try {
            await alertsService.resolveAlert(id, note || 'Alerte traitée par l\'agriculteur');
            fetchAlerts();
        } catch (err) {
            alert(`Erreur résolution: ${err.message}`);
        } finally {
            setResolving(false);
        }
    };

    const filteredAlerts = alerts.filter(
        (a) =>
            a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.field?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (level) => {
        if (level === 'CRITICAL') return <TriangleAlert className="text-red-500" size={20} />;
        if (level === 'WARNING') return <TriangleAlert className="text-amber-500" size={20} />;
        return <Info className="text-neon-blue" size={20} />;
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6 fade-in">
            {/* Alerts List */}
            <div className={`${showMobileDetail ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col gap-4 overflow-hidden`}>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Filtrer les alertes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-navy-800 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neon-blue"
                        />
                    </div>
                    <button
                        onClick={fetchAlerts}
                        className="p-2 bg-navy-800 border border-white/10 rounded-xl hover:text-neon-blue transition text-gray-300"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                    {filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            onClick={() => {
                                setSelectedAlert(alert);
                                setShowMobileDetail(true);
                            }}
                            className={`
                p-4 rounded-xl border bg-navy-800/50 cursor-pointer transition-all
                ${alert.level === 'CRITICAL' ? 'border-red-500/40 hover:bg-red-500/10' : alert.level === 'WARNING' ? 'border-amber-500/40 hover:bg-amber-500/10' : 'border-neon-blue/40 hover:bg-neon-blue/10'}
                ${selectedAlert?.id === alert.id ? 'bg-white/10 border-white/30 shadow-lg scale-[1.01]' : ''}
              `}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 font-bold text-white text-sm">
                                    {getIcon(alert.level)}
                                    <span>{alert.title}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">
                                    {new Date(alert.detectedAt || alert.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs text-neon-cyan mb-1">{alert.field?.name || 'Parcelle non spécifiée'}</p>
                            <p className="text-xs text-gray-300 line-clamp-2">{alert.message}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alert Detail Panel */}
            <div className={`${showMobileDetail ? 'flex' : 'hidden md:flex'} flex-1 glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex-col relative overflow-y-auto bg-navy-900/70 backdrop-blur-xl border border-white/10`}>
                {/* Mobile Back Button */}
                {showMobileDetail && (
                    <button
                        onClick={() => setShowMobileDetail(false)}
                        className="md:hidden flex items-center gap-2 text-xs font-semibold text-neon-blue hover:text-neon-cyan mb-3 self-start px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                    >
                        <ArrowLeft size={16} />
                        <span>Retour aux alertes</span>
                    </button>
                )}

                {selectedAlert ? (
                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${selectedAlert.level === 'CRITICAL'
                                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                        : selectedAlert.level === 'WARNING'
                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                            : 'bg-neon-blue/20 text-neon-cyan border-neon-blue/40'
                                    }`}
                            >
                                {selectedAlert.level || 'INFO'}
                            </span>
                            <span className="text-gray-400 text-xs font-mono">Type: {selectedAlert.type}</span>
                            <span className="text-gray-400 text-xs font-mono sm:ml-auto">ID: #{selectedAlert.id.slice(0, 8)}</span>
                        </div>

                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{selectedAlert.title}</h2>
                            <p className="text-base sm:text-lg text-neon-cyan">{selectedAlert.field?.name || 'Parcelle Concernée'}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-navy-950/80 rounded-xl border border-white/5">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Description de l'Alerte</h4>
                                <p className="text-sm text-white">{selectedAlert.message}</p>
                            </div>
                            <div className="p-4 bg-navy-950/80 rounded-xl border border-white/5">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Statut de Résolution</h4>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className={selectedAlert.resolved ? 'text-emerald-400' : 'text-gray-500'} />
                                    <span className="text-sm text-white">
                                        {selectedAlert.resolved ? 'Résolue' : 'En attente d\'action agronomique'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Box */}
                        <div className="bg-gradient-to-r from-neon-blue/10 to-neon-cyan/10 border border-neon-blue/30 p-6 rounded-2xl flex items-start gap-4">
                            <BrainCircuit size={28} className="text-neon-blue shrink-0 mt-1" />
                            <div className="space-y-3 flex-1">
                                <h3 className="text-base font-bold text-white">Recommandation Moteur Agrotechnologique</h3>
                                <p className="text-xs text-gray-300">
                                    Le système recommande de vérifier l'irrigation, d'isoler la parcelle en cas de risque de maladie foliaire, ou de dépêcher un technicien.
                                </p>
                                {!selectedAlert.resolved && (
                                    <button
                                        onClick={() => handleResolveAlert(selectedAlert.id)}
                                        disabled={resolving}
                                        className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold rounded-xl text-xs hover:shadow-lg transition-all"
                                    >
                                        {resolving ? 'Résolution...' : 'Résoudre cette Alerte'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Sélectionnez une alerte pour afficher les détails.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsPage;

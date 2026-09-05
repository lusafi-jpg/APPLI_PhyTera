import React, { useState, useEffect } from 'react';
import { TriangleAlert, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { alertsService } from '../../services/alertsService';

const AlertCard = () => {
    const navigate = useNavigate();
    const [latestAlert, setLatestAlert] = useState(null);

    useEffect(() => {
        async function loadAlerts() {
            try {
                const data = await alertsService.getAlerts();
                const list = Array.isArray(data) ? data : [];
                const activeAlerts = list.filter(a => !a.resolved);
                if (activeAlerts.length > 0) {
                    setLatestAlert(activeAlerts[0]);
                } else {
                    setLatestAlert(null);
                }
            } catch (e) {
                setLatestAlert(null);
            }
        }
        loadAlerts();
    }, []);

    if (latestAlert) {
        return (
            <div
                onClick={() => navigate('/alerts')}
                className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-red-900/40 to-navy-900/80 border-red-500/30 group cursor-pointer hover:border-red-500/50 transition-all"
            >
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <TriangleAlert size={48} className="text-red-500" />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 animate-pulse">
                                {latestAlert.level || 'URGENT'}
                            </span>
                            <span className="text-gray-400 text-xs">
                                {latestAlert.detectedAt || latestAlert.createdAt
                                    ? new Date(latestAlert.detectedAt || latestAlert.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                    : 'Récent'}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{latestAlert.title}</h3>
                        <p className="text-gray-300 text-sm mb-4">{latestAlert.message}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-neon-cyan">{latestAlert.field?.name || 'Parcelle'}</span>
                        <button className="flex items-center gap-2 text-sm font-semibold text-red-400 group-hover:translate-x-1 transition-transform">
                            Voir l'analyse <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => navigate('/alerts')}
            className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-emerald-900/20 to-navy-900/80 border-emerald-500/30 group cursor-pointer hover:border-emerald-500/50 transition-all"
        >
            <div className="absolute top-0 right-0 p-4 opacity-30">
                <CheckCircle size={48} className="text-emerald-400" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            SYSTÈME OPTIMAL
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Aucune alerte active</h3>
                    <p className="text-gray-300 text-sm mb-4">Vos exploitations et parcelles ne présentent aucune anomalie détectée.</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-emerald-400">Santé 100%</span>
                    <button className="flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                        Centre d'alertes <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertCard;

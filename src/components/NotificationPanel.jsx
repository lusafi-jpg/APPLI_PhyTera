import React from 'react';
import { Bell, Check, X, Info, TriangleAlert, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockNotifications = [
    {
        id: 1,
        type: 'critical',
        title: 'Alerte Mildiou',
        message: 'Détection confirmée sur Parcelle 2. Risque élevé.',
        time: '10 min',
        read: false
    },
    {
        id: 2,
        type: 'warning',
        title: 'Stress Hydrique',
        message: 'Niveau bas sur zone Est. Irrigation recommandée.',
        time: '45 min',
        read: false
    },
    {
        id: 3,
        type: 'system',
        title: 'Mise à jour Système',
        message: 'PhyTera v2.4 installée avec succès.',
        time: '2h',
        read: true
    },
    {
        id: 4,
        type: 'success',
        title: 'Irrigation Terminée',
        message: 'Cycle complet effectué sur Parcelle 1.',
        time: '3h',
        read: true
    },
    {
        id: 5,
        type: 'info',
        title: 'Nouveau Rapport',
        message: 'Le rapport mensuel est disponible.',
        time: '1j',
        read: true
    }
];

const NotificationPanel = ({ onClose }) => {
    const navigate = useNavigate();

    const getIcon = (type) => {
        switch (type) {
            case 'critical': return <TriangleAlert size={16} className="text-red-500" />;
            case 'warning': return <TriangleAlert size={16} className="text-orange-500" />;
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'system': return <Info size={16} className="text-neon-blue" />;
            default: return <Info size={16} className="text-gray-400" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'critical': return 'bg-red-500/10 border-red-500/20';
            case 'warning': return 'bg-orange-500/10 border-orange-500/20';
            case 'success': return 'bg-green-500/10 border-green-500/20';
            case 'system': return 'bg-neon-blue/10 border-neon-blue/20';
            default: return 'bg-navy-800 border-white/5';
        }
    };

    return (
        <div className="absolute top-16 right-4 w-96 max-w-[90vw] bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-neon-blue" />
                    <h3 className="font-bold text-white">Notifications</h3>
                    <span className="px-2 py-0.5 rounded-full bg-neon-alert text-white text-[10px] font-bold">2</span>
                </div>
                <button className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1">
                    <Check size={14} /> Tout marquer comme lu
                </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
                {mockNotifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-l-2 ${notif.read ? 'border-transparent opacity-60' : 'border-neon-blue'}`}
                        onClick={() => {
                            if (notif.type === 'critical' || notif.type === 'warning') {
                                navigate('/alerts');
                                onClose();
                            }
                        }}
                    >
                        <div className="flex gap-3">
                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(notif.type)} border`}>
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`text-sm font-semibold ${notif.read ? 'text-gray-300' : 'text-white'}`}>{notif.title}</h4>
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                        {notif.time}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                            </div>
                            {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-neon-blue mt-2"></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-black/20 rounded-b-2xl">
                <button
                    onClick={() => {
                        navigate('/alerts');
                        onClose();
                    }}
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition rounded-xl hover:bg-white/5"
                >
                    Voir toutes les alertes
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShieldAlert, Sparkles, Cpu, Clock, RefreshCw } from 'lucide-react';
import { notificationsService } from '../services/notificationsService';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationsService.getMyNotifications();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('Backend notifications endpoint error, fallback to mock data');
            setNotifications([
                {
                    id: 'notif-1',
                    title: 'Alerte Risque Mildiou élevée',
                    body: 'Humidité de 92% mesurée sur la Parcelle Nord. Risque d\'infection imminente.',
                    type: 'WEBSOCKET',
                    priority: 'HIGH',
                    read: false,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: 'notif-2',
                    title: 'Survol Drone Terminé',
                    body: 'La carte NDVI de la Parcelle Sud est disponible.',
                    type: 'PUSH',
                    priority: 'MEDIUM',
                    read: true,
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsService.markAsRead(id);
            fetchNotifications();
        } catch (err) {
            // Local toggle
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-neon-blue" />
                        Centre de Notifications
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Notifications en temps réel Push, WebSocket et Montres connectées du système agronomique PHYTERA.
                    </p>
                </div>

                <button
                    onClick={fetchNotifications}
                    className="p-2.5 rounded-xl bg-navy-800 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all self-start md:self-auto"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-24 rounded-2xl bg-navy-900/50 border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-16 bg-navy-900/30 border border-white/5 rounded-2xl">
                    <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white">Aucune notification</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mt-1">
                        Vous êtes à jour. Aucune nouvelle notification pour le moment.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${n.read
                                    ? 'bg-navy-900/40 border-white/5 opacity-70'
                                    : 'bg-navy-900/80 border-neon-blue/40 shadow-lg shadow-neon-blue/5'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${n.priority === 'HIGH' || n.priority === 'CRITICAL'
                                            ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                                            : 'bg-neon-blue/20 border border-neon-blue/40 text-neon-cyan'
                                        }`}
                                >
                                    {n.priority === 'HIGH' || n.priority === 'CRITICAL' ? (
                                        <ShieldAlert size={20} />
                                    ) : (
                                        <Sparkles size={20} />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white text-base">{n.title}</h3>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300">
                                            {n.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300">{n.body}</p>
                                    <span className="text-xs text-gray-500 flex items-center gap-1 pt-1">
                                        <Clock size={12} /> {new Date(n.createdAt).toLocaleString('fr-FR')}
                                    </span>
                                </div>
                            </div>

                            {!n.read && (
                                <button
                                    onClick={() => handleMarkAsRead(n.id)}
                                    className="px-3 py-1.5 rounded-xl bg-neon-blue/10 border border-neon-blue/30 text-neon-cyan hover:bg-neon-blue/20 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
                                >
                                    <CheckCheck size={14} /> Marquer lu
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

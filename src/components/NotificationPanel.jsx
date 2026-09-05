import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Info, TriangleAlert, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsService } from '../services/notificationsService';

const NotificationPanel = ({ onClose }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadNotifications() {
            try {
                const data = await notificationsService.getMyNotifications();
                setNotifications(Array.isArray(data) ? data : []);
            } catch (e) {
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        }
        loadNotifications();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'CRITICAL': return <TriangleAlert size={16} className="text-red-500" />;
            case 'WARNING': return <TriangleAlert size={16} className="text-orange-500" />;
            case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
            default: return <Info size={16} className="text-neon-blue" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'CRITICAL': return 'bg-red-500/10 border-red-500/20';
            case 'WARNING': return 'bg-orange-500/10 border-orange-500/20';
            case 'SUCCESS': return 'bg-green-500/10 border-green-500/20';
            default: return 'bg-neon-blue/10 border-neon-blue/20';
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) { }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="absolute top-14 -right-12 sm:right-0 w-[calc(100vw-2rem)] sm:w-96 max-w-[360px] sm:max-w-sm bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-neon-blue" />
                    <h3 className="font-bold text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-neon-alert text-white text-[10px] font-bold">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                        className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1"
                    >
                        <Check size={14} /> Marquer lu
                    </button>
                )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto scrollbar-hide py-2">
                {notifications.length === 0 ? (
                    <div className="py-8 text-center px-4">
                        <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-white">Aucune notification</p>
                        <p className="text-xs text-gray-400 mt-1">Vous n'avez aucun message en attente pour votre compte.</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-l-2 ${notif.isRead ? 'border-transparent opacity-60' : 'border-neon-blue'}`}
                            onClick={() => {
                                handleMarkAsRead(notif.id);
                                if (notif.alertId) navigate('/alerts');
                            }}
                        >
                            <div className="flex gap-3">
                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(notif.priority)} border`}>
                                    {getIcon(notif.priority)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-1">
                                        <h4 className={`text-sm font-semibold truncate ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-[10px] text-gray-500 shrink-0">
                                            {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
                                </div>
                                {!notif.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-neon-blue mt-2 shrink-0"></div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-black/20 rounded-b-2xl">
                <button
                    onClick={() => {
                        navigate('/alerts');
                        onClose();
                    }}
                    className="w-full py-2 flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-white transition rounded-xl hover:bg-white/5"
                >
                    Voir le centre d'alertes
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;

import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Shield, Moon, Globe, ChevronRight, Save, RefreshCw } from 'lucide-react';
import { usersService } from '../services/usersService';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userProfile, setUserProfile] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : { nom: 'Agriculteur', email: 'agriculteur@phytera.ag', role: 'AGRICULTEUR' };
        } catch (e) {
            return { nom: 'Agriculteur', email: 'agriculteur@phytera.ag', role: 'AGRICULTEUR' };
        }
    });

    const [preferences, setPreferences] = useState({
        emailAlerts: true,
        smsAlerts: true,
        weeklyReport: true,
        language: 'fr',
        theme: 'dark',
    });

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await usersService.getProfile();
            if (data) {
                setUserProfile((prev) => ({ ...prev, ...data }));
                if (data.preferences) setPreferences((prev) => ({ ...prev, ...data.preferences }));
            }
        } catch (err) {
            console.warn('Backend users endpoint unavailable, fallback to local settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await usersService.updateProfile({ nom: userProfile.nom, email: userProfile.email });
            await usersService.updatePreferences(preferences);
            localStorage.setItem('user', JSON.stringify(userProfile));
            alert('Modifications enregistrées avec succès !');
        } catch (err) {
            alert(`Erreur enregistrement: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Sécurité', icon: Lock },
        { id: 'account', label: 'Préférences', icon: Shield },
    ];

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Paramètres & Profil</h1>
                    <p className="text-gray-400 text-sm">Gérez vos identifiants, votre rôle et vos préférences agronomiques.</p>
                </div>
                <button
                    onClick={fetchProfile}
                    className="p-2 bg-navy-800 border border-white/10 rounded-xl hover:text-neon-blue transition text-gray-300"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Sidebar / Tabs */}
                <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 md:w-64 flex-shrink-0 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap text-sm ${activeTab === tab.id
                                ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 font-semibold'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                                }`}
                        >
                            <tab.icon size={18} className="shrink-0" />
                            <span className="font-medium">{tab.label}</span>
                            {activeTab === tab.id && <ChevronRight size={16} className="ml-auto hidden md:inline" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 space-y-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.nom)}&background=0284c7&color=fff&size=128`}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full border-2 border-neon-blue/40 shadow-xl shrink-0"
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{userProfile.nom}</h3>
                                        <p className="text-gray-400 text-xs font-mono uppercase mt-0.5">{userProfile.role || 'AGRICULTEUR'}</p>
                                        <div className="mt-2 flex justify-center sm:justify-start gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full bg-neon-blue/10 text-neon-cyan text-[10px] font-bold uppercase border border-neon-blue/30">
                                                Compte Vérifié
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 uppercase">Nom Complet</label>
                                        <input
                                            type="text"
                                            value={userProfile.nom}
                                            onChange={(e) => setUserProfile({ ...userProfile, nom: e.target.value })}
                                            className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-neon-blue outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 uppercase">Email</label>
                                        <input
                                            type="email"
                                            value={userProfile.email}
                                            onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                                            className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-neon-blue outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Canaux de Notifications</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-4 rounded-xl bg-navy-950 border border-white/5 cursor-pointer">
                                        <div>
                                            <div className="font-semibold text-sm text-white">Alertes Critiques par Email</div>
                                            <div className="text-xs text-gray-400">Notifications immédiates pour stress hydrique et mildiou</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferences.emailAlerts}
                                            onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                                            className="w-5 h-5 rounded text-neon-blue"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 rounded-xl bg-navy-950 border border-white/5 cursor-pointer">
                                        <div>
                                            <div className="font-semibold text-sm text-white">Alertes SMS / Montres Connectées</div>
                                            <div className="text-xs text-gray-400">Envoi de messages courts et vibrations sur smartwatch</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preferences.smsAlerts}
                                            onChange={(e) => setPreferences({ ...preferences, smsAlerts: e.target.checked })}
                                            className="w-5 h-5 rounded text-neon-blue"
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Sécurité du Compte</h3>
                                <p className="text-xs text-gray-400">Token JWT stocké dans le navigateur et valide pour l'API NestJS.</p>
                            </div>
                        )}

                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Langue & Région</h3>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-navy-950 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Globe className="text-neon-blue" size={20} />
                                        <span className="text-sm font-semibold text-white">Langue de l'Interface</span>
                                    </div>
                                    <select
                                        value={preferences.language}
                                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                        className="bg-navy-900 border border-white/10 text-xs text-white rounded-lg px-3 py-2"
                                    >
                                        <option value="fr">Français</option>
                                        <option value="en">English</option>
                                        <option value="sw">Swahili</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold rounded-xl shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 transition-all text-sm"
                        >
                            <Save size={18} />
                            {saving ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

import React, { useState, useEffect } from 'react';
import { Sprout, Layers, MapPin } from 'lucide-react';

const WelcomeCard = () => {
    const [user, setUser] = useState({ nom: 'Agriculteur', role: 'AGRICULTEUR' });

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) { }
    }, []);

    const userName = user.nom || 'Agriculteur';

    return (
        <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-blue/20 rounded-full blur-3xl group-hover:bg-neon-blue/30 transition-colors duration-500"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="relative shrink-0">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0284c7&color=fff&size=128`}
                        alt="Profile"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/20 shadow-lg object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-neon-green text-navy-900 text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full border border-navy-900">
                        {user.role || 'PRO'}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 truncate">
                        Bienvenue, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-cyan">{userName}</span>
                    </h2>
                    <p className="text-gray-400 text-sm mb-4 sm:mb-6 max-w-md">
                        Vos cultures se portent bien aujourd'hui. L'analyse IA suggère une irrigation modérée sur vos parcelles.
                    </p>

                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm">
                            <MapPin size={15} className="text-neon-violet shrink-0" />
                            <span className="font-medium">Exploitations Actives</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm">
                            <Layers size={15} className="text-neon-cyan shrink-0" />
                            <span className="font-medium">Suivi Sol & IoT</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm">
                            <Sprout size={15} className="text-neon-green shrink-0" />
                            <span className="font-medium">Agronomie IA</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeCard;

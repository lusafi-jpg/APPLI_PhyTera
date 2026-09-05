import React from 'react';
import { Sprout, Layers, MapPin } from 'lucide-react';

const WelcomeCard = () => {
    return (
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-blue/20 rounded-full blur-3xl group-hover:bg-neon-blue/30 transition-colors duration-500"></div>

            <div className="relative z-10 flex items-start gap-6">
                <div className="relative">
                    <img
                        src="https://ui-avatars.com/api/?name=Mama+Helene&background=random&size=128"
                        alt="Profile"
                        className="w-20 h-20 rounded-2xl border-2 border-white/20 shadow-lg object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-neon-green text-navy-900 text-xs font-bold px-2 py-1 rounded-full border border-navy-900">
                        Pro
                    </div>
                </div>

                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Bienvenue, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-cyan">Mama Hélène</span>
                    </h2>
                    <p className="text-gray-400 mb-6 max-w-md">
                        Vos cultures se portent bien aujourd'hui. L'analyse IA suggère une irrigation modérée sur la parcelle Nord.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <MapPin size={16} className="text-neon-violet" />
                            <span className="text-sm font-medium">12 Parcelles</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <Layers size={16} className="text-neon-cyan" />
                            <span className="text-sm font-medium">3 Types de Sol</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <Sprout size={16} className="text-neon-green" />
                            <span className="text-sm font-medium">Maïs & Cacao</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeCard;

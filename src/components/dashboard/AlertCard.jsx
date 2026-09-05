import React from 'react';
import { TriangleAlert, ArrowRight } from 'lucide-react';

const AlertCard = () => {
    return (
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-red-900/40 to-navy-900/80 border-red-500/30 group cursor-pointer hover:border-red-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <TriangleAlert size={48} className="text-red-500" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 animate-pulse">
                            URGENT
                        </span>
                        <span className="text-gray-400 text-xs">Il y a 10 min</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Détection Mildiou</h3>
                    <p className="text-gray-300 text-sm mb-4">Parcelle 2 (Nord-Est) - Risque élevé de propagation.</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-3">
                        <img className="w-8 h-8 rounded-full border border-navy-900" src="https://ui-avatars.com/api/?name=Farmer+1&background=random" alt="Farmer" />
                        <img className="w-8 h-8 rounded-full border border-navy-900" src="https://ui-avatars.com/api/?name=Agronomist&background=random" alt="Agro" />
                    </div>
                    <button className="flex items-center gap-2 text-sm font-semibold text-red-400 group-hover:translate-x-1 transition-transform">
                        Voir l'analyse <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertCard;

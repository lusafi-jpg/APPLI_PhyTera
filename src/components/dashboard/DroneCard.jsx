import React from 'react';
import { Disc, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DroneCard = () => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate('/drone-missions')}
            className="glass-panel rounded-3xl relative overflow-hidden h-full min-h-[250px] group cursor-pointer border border-white/10 hover:border-neon-blue/40 transition-all flex flex-col justify-between p-6 bg-gradient-to-br from-navy-900/90 to-navy-950"
        >
            {/* Background pattern */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-neon-cyan/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                    <span className="text-white text-xs font-mono">DRONE AGROTECH</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">En attente</span>
            </div>

            <div className="py-4">
                <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan mb-3">
                    <Disc size={24} className="group-hover:rotate-45 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Surveillance Aérienne</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Planifiez des vols de drones pour cartographier vos parcelles en indice NDVI multispectral.
                </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="text-gray-400">0 mission en cours</span>
                <span className="text-neon-cyan font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Planifier un vol <ArrowRight size={14} />
                </span>
            </div>
        </div>
    );
};

export default DroneCard;

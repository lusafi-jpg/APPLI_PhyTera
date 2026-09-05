import React from 'react';
import { ScanLine, Crosshair } from 'lucide-react';

const DroneCard = () => {
    return (
        <div className="glass-panel rounded-3xl relative overflow-hidden h-full min-h-[250px] group">
            {/* Background Image (Simulated) */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-5848c4281b9ad?q=80&w=1000&auto=format&fit=crop')" }} // Placeholder Farm Image
            ></div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-navy-900/40 group-hover:bg-navy-900/30 transition-colors"></div>

            {/* Scan Line Animation */}
            <div className="absolute inset-0 border-2 border-neon-blue/0 group-hover:border-neon-blue/50 transition-colors rounded-3xl"></div>

            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur rounded-lg px-3 py-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-mono">LIVE FEED - DRONE-04</span>
            </div>

            {/* Anomaly Highlight */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-24 h-24 border-2 border-red-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="absolute inset-0 bg-red-500/20 rounded-full"></div>
                <Crosshair size={24} className="text-red-500" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-navy-900 via-navy-900/80 to-transparent">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ScanLine size={18} className="text-neon-cyan" />
                    Anomalie Détectée
                </h3>
                <p className="text-xs text-gray-300">Zone B4: Chlorose possible détectée par imagerie multispectrale.</p>
            </div>
        </div>
    );
};

export default DroneCard;

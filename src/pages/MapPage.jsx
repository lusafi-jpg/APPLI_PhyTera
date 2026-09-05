import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Info, Droplets, Sun, ChevronDown, ChevronUp } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock Fields Data
const fields = [
    {
        id: 1,
        name: 'Parcelle Nord (Maïs)',
        status: 'healthy',
        color: '#00FF9D',
        positions: [
            [5.340, -4.050],
            [5.342, -4.050],
            [5.342, -4.048],
            [5.340, -4.048],
        ],
        data: { humidity: '65%', temp: '28°C', ph: '6.5' }
    },
    {
        id: 2,
        name: 'Parcelle Est (Cacao)',
        status: 'warning',
        color: '#FF3838', // Red/Alert
        positions: [
            [5.338, -4.045],
            [5.340, -4.045],
            [5.340, -4.042],
            [5.338, -4.043],
        ],
        data: { humidity: '40%', temp: '31°C', ph: '5.8' }
    },
    {
        id: 3,
        name: 'Zone Test B4',
        status: 'monitor',
        color: '#00F0FF',
        positions: [
            [5.343, -4.046],
            [5.345, -4.046],
            [5.345, -4.044],
            [5.343, -4.044],
        ],
        data: { humidity: '55%', temp: '27°C', ph: '6.2' }
    }
];

const MapPage = () => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(true);

    return (
        <div className="h-[calc(100vh-8rem)] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/5 relative shadow-2xl fade-in">
            {/* Map Controls / Overlay */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[400] bg-navy-900/90 backdrop-blur p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 w-56 sm:w-64 max-w-[calc(100%-1.5rem)] shadow-xl">
                <button
                    onClick={() => setIsOverlayOpen(!isOverlayOpen)}
                    className="w-full text-white font-bold flex items-center justify-between gap-2"
                >
                    <span className="flex items-center gap-2 text-sm sm:text-base">
                        <MapPin size={16} className="text-neon-blue" />
                        Vue Satellitaire
                    </span>
                    <span className="text-gray-400 sm:hidden">
                        {isOverlayOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                </button>

                {isOverlayOpen && (
                    <div className="space-y-2 mt-3 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Parcelles Actives</span>
                            <span className="text-white font-mono font-bold">12</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Capteurs Online</span>
                            <span className="text-neon-green font-mono font-bold">98%</span>
                        </div>
                        <div className="text-[11px] text-gray-500 pt-1 leading-tight">
                            Cliquez sur une zone pour voir les détails agronomiques.
                        </div>
                    </div>
                )}
            </div>

            <MapContainer
                center={[5.341, -4.047]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                {/* Dark Tile Layer for "Satellite Night" feel */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {fields.map((field) => (
                    <Polygon
                        key={field.id}
                        positions={field.positions}
                        pathOptions={{
                            color: field.color,
                            fillColor: field.color,
                            fillOpacity: 0.2,
                            weight: 2
                        }}
                    >
                        <Popup className="glass-popup">
                            <div className="p-2 min-w-[200px]">
                                <h4 className="font-bold text-navy-900 text-lg mb-2 border-b border-navy-900/10 pb-1">{field.name}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm text-navy-800">
                                    <div className="flex items-center gap-1">
                                        <Droplets size={14} className="text-blue-500" />
                                        <span>{field.data.humidity}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Sun size={14} className="text-orange-500" />
                                        <span>{field.data.temp}</span>
                                    </div>
                                    <div className="col-span-2 text-xs font-semibold mt-1 px-2 py-1 bg-navy-900/5 rounded text-center">
                                        Statut: {field.status.toUpperCase()}
                                    </div>
                                </div>
                                <a href={`/fields/${field.id}`} className="block w-full text-center mt-3 bg-navy-900 text-white text-xs py-1.5 rounded hover:bg-navy-800 transition">
                                    Voir Analyse Complète
                                </a>
                            </div>
                        </Popup>
                    </Polygon>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapPage;

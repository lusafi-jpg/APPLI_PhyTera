import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Droplets, Sun, ChevronDown, ChevronUp, Plus, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { farmsService } from '../services/farmsService';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPage = () => {
    const navigate = useNavigate();
    const [isOverlayOpen, setIsOverlayOpen] = useState(true);
    const [farms, setFarms] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await farmsService.getAllFarms();
                const farmList = Array.isArray(data) ? data : [];
                setFarms(farmList);
                // Extract all fields
                const allFields = farmList.flatMap(f => (f.fields || []).map(field => ({ ...field, farmName: f.name })));
                setFields(allFields);
            } catch (e) {
                setFarms([]);
                setFields([]);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Default center (Kinshasa coordinates or center of first field)
    const center = [-4.325, 15.312];

    return (
        <div className="h-[calc(100vh-8rem)] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/5 relative shadow-2xl fade-in">
            {/* Map Controls / Overlay */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[400] bg-navy-900/90 backdrop-blur p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 w-60 sm:w-72 max-w-[calc(100%-1.5rem)] shadow-xl">
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
                            <span className="text-white font-mono font-bold">{fields.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Exploitations</span>
                            <span className="text-neon-green font-mono font-bold">{farms.length}</span>
                        </div>

                        {fields.length === 0 ? (
                            <div className="pt-2 border-t border-white/5 space-y-2">
                                <p className="text-[11px] text-gray-400 leading-tight">
                                    Vous n'avez pas encore de parcelles enregistrées sur votre compte.
                                </p>
                                <button
                                    onClick={() => navigate('/farms')}
                                    className="w-full py-2 bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:shadow-lg transition"
                                >
                                    <Plus size={14} /> Créer une exploitation
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-white/5 space-y-2">
                                <div className="text-[11px] text-gray-500 leading-tight">
                                    Cliquez sur une parcelle pour afficher les indicateurs agronomiques.
                                </div>
                                <button
                                    onClick={() => navigate('/farms')}
                                    className="w-full py-1.5 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 text-neon-cyan rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                                >
                                    <Plus size={13} /> Gérer / Créer un champ
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {fields.map((field) => {
                    const coords = field.locationPolygon?.coordinates?.[0]?.map(pt => [pt[1], pt[0]]) || [];
                    if (coords.length === 0) return null;
                    return (
                        <Polygon
                            key={field.id}
                            positions={coords}
                            pathOptions={{
                                color: '#00FF9D',
                                fillColor: '#00FF9D',
                                fillOpacity: 0.25,
                                weight: 2
                            }}
                        >
                            <Popup className="glass-popup">
                                <div className="p-2 min-w-[200px]">
                                    <h4 className="font-bold text-navy-900 text-base mb-1 border-b border-navy-900/10 pb-1">
                                        {field.name}
                                    </h4>
                                    <p className="text-xs text-navy-700 mb-2">Culture: {field.cultureType || 'Non spécifiée'}</p>
                                    <button
                                        onClick={() => navigate(`/fields/${field.id}`)}
                                        className="block w-full text-center mt-2 bg-navy-900 text-white text-xs py-1.5 rounded-lg hover:bg-navy-800 transition"
                                    >
                                        Détails Parcelle
                                    </button>
                                </div>
                            </Popup>
                        </Polygon>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapPage;

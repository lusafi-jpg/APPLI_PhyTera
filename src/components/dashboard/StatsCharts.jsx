import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Cpu, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { devicesService } from '../../services/devicesService';

const COLORS = ['#00F0FF', '#7B2CBF', '#4CC9F0', '#00FF9D'];

export const DeviceStatsCard = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDevices() {
            try {
                const data = await devicesService.getAllDevices();
                setDevices(Array.isArray(data) ? data : []);
            } catch (e) {
                setDevices([]);
            } finally {
                setLoading(false);
            }
        }
        loadDevices();
    }, []);

    // Group devices by type or status
    const deviceCounts = devices.reduce((acc, dev) => {
        const type = dev.deviceType || 'ESP32';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.keys(deviceCounts).map((key) => ({
        name: key.replace('ESP32_', '').replace('_', ' '),
        count: deviceCounts[key],
    }));

    return (
        <div className="glass-panel p-6 rounded-3xl flex flex-col h-64 justify-between">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Appareils Connectés</h3>
                <span className="text-xs font-mono text-neon-cyan px-2.5 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20">
                    {devices.length} IoT
                </span>
            </div>

            {devices.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                    <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue mb-2">
                        <Cpu size={20} />
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Aucun boîtier IoT associé à votre compte.</p>
                    <button
                        onClick={() => navigate('/devices')}
                        className="px-3 py-1.5 rounded-lg bg-neon-blue/20 border border-neon-blue/40 text-neon-cyan text-xs font-semibold hover:bg-neon-blue/30 transition flex items-center gap-1.5"
                    >
                        <Plus size={14} /> Enregistrer un appareil
                    </button>
                </div>
            ) : (
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#101826', borderRadius: '12px', border: '1px solid #1e293b' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export const SoilDensityCard = () => {
    return (
        <div className="glass-panel p-6 rounded-3xl flex flex-col h-64">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">Humidité & Densité Sol</h3>
                <span className="text-neon-cyan font-bold text-base">En attente</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Moyenne des télémesures transmises par vos sondes.</p>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                <p className="text-xs text-gray-400 leading-relaxed">
                    Les graphiques d'humidité s'afficheront dès qu'un boîtier IoT transmettra des données de sol.
                </p>
            </div>
        </div>
    );
};

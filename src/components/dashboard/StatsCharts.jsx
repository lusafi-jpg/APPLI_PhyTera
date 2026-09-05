import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const deviceData = [
    { name: 'Sondes', count: 120 },
    { name: 'Drones', count: 45 },
    { name: 'Caméras', count: 70 },
    { name: 'Stations', count: 25 },
];

const soilData = [
    { time: '08:00', density: 40 },
    { time: '10:00', density: 35 },
    { time: '12:00', density: 50 },
    { time: '14:00', density: 45 },
    { time: '16:00', density: 60 },
    { time: '18:00', density: 55 },
];

const COLORS = ['#00F0FF', '#7B2CBF', '#4CC9F0', '#00FF9D'];

export const DeviceStatsCard = () => {
    return (
        <div className="glass-panel p-6 rounded-3xl flex flex-col h-64">
            <h3 className="text-lg font-semibold text-white mb-4">Appareils Connectés</h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deviceData}>
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#101826', borderRadius: '12px', border: '1px solid #1e293b' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={30}>
                            {deviceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const SoilDensityCard = () => {
    return (
        <div className="glass-panel p-6 rounded-3xl flex flex-col h-64">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Humidité & Densité</h3>
                <span className="text-neon-cyan font-bold text-xl">42%</span>
            </div>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={soilData}>
                        <defs>
                            <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4CC9F0" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#4CC9F0" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#101826', borderRadius: '12px', border: '1px solid #1e293b' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="density" stroke="#4CC9F0" strokeWidth={3} fillOpacity={1} fill="url(#colorDensity)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

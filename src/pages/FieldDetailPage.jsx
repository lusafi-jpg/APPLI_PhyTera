import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Sun, Wind, Activity, Sprout, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const fieldHistoryData = [
    { day: 'Lun', humidity: 65, growth: 10 },
    { day: 'Mar', humidity: 62, growth: 12 },
    { day: 'Mer', humidity: 70, growth: 15 },
    { day: 'Jeu', humidity: 68, growth: 18 },
    { day: 'Ven', humidity: 75, growth: 22 },
    { day: 'Sam', humidity: 72, growth: 25 },
    { day: 'Dim', humidity: 68, growth: 28 },
];

const Gauge = ({ value, max, label, unit, color }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-navy-800"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-2xl font-bold">{value}</span>
                    <span className="text-xs text-gray-400">{unit}</span>
                </div>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-300">{label}</span>
        </div>
    );
};

const FieldDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data based on ID - in real app fetch from API
    const fieldName = `Parcelle #${id || 'Inconnue'}`;

    return (
        <div className="fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/fields')}
                    className="p-2 rounded-full bg-navy-800 hover:bg-white/10 text-gray-400 hover:text-white transition"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        {fieldName}
                        <span className="px-3 py-1 rounded-full bg-neon-green/10 text-neon-green text-xs font-bold border border-neon-green/20">
                            SAINE
                        </span>
                    </h1>
                    <p className="text-gray-400">Culture: Maïs Hybride • Semis: 12 Oct 2024</p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center">
                    <Gauge value={68} max={100} label="Humidité Sol" unit="%" color="#00F0FF" />
                </div>
                <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center">
                    <Gauge value={28} max={50} label="Température" unit="°C" color="#FF9F1C" />
                </div>
                <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center">
                    <Gauge value={6.5} max={14} label="pH Sol" unit="pH" color="#7B2CBF" />
                </div>
                <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32 flex items-center justify-center bg-neon-green/10 rounded-full mb-2">
                        <Sprout size={48} className="text-neon-green" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-300">Stade: Floraison</span>
                </div>
            </div>

            {/* Analysis Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="text-neon-blue" />
                        Croissance & Humidité (7 Jours)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={fieldHistoryData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00FF9D" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00FF9D" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#101826', borderRadius: '12px', border: '1px solid #1e293b' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <CartesianGrid vertical={false} stroke="#1e293b" />
                                <Area type="monotone" dataKey="growth" stroke="#00FF9D" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" name="Croissance (cm)" />
                                <Area type="monotone" dataKey="humidity" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" name="Humidité (%)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recommendations Side Panel */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <TrendingUp size={64} className="text-neon-violet" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">Prédictions IA</h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-navy-900/50 rounded-xl border border-white/5">
                            <h4 className="text-neon-cyan font-bold text-sm mb-1">RECOMMANDATION IRRIGATION</h4>
                            <p className="text-gray-300 text-sm">Prévoyez un arrosage de 30mm demain matin à 06:00 pour optimiser la floraison.</p>
                        </div>

                        <div className="p-4 bg-navy-900/50 rounded-xl border border-white/5">
                            <h4 className="text-neon-violet font-bold text-sm mb-1">FERTILISATION (NPK)</h4>
                            <p className="text-gray-300 text-sm">Niveaux d'Azote stables. Aucun apport nécessaire pour les 48h prochaines.</p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <h4 className="text-white font-bold mb-2">Rendement Estimé</h4>
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">
                                12.5 T/ha
                            </div>
                            <p className="text-green-500 text-sm flex items-center gap-1 mt-1">
                                <TrendingUp size={14} /> +5% vs Année N-1
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldDetailPage;

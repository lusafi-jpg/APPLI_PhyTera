import React, { useState } from 'react';
import {
    TrendingUp,
    Droplets,
    Activity,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    BrainCircuit,
    Leaf
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// Mock Data
const performanceData = [
    { name: 'Lun', production: 4000, target: 2400 },
    { name: 'Mar', production: 3000, target: 1398 },
    { name: 'Mer', production: 2000, target: 9800 },
    { name: 'Jeu', production: 2780, target: 3908 },
    { name: 'Ven', production: 1890, target: 4800 },
    { name: 'Sam', production: 2390, target: 3800 },
    { name: 'Dim', production: 3490, target: 4300 },
];

const envData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    humidity: 40 + Math.random() * 40,
    temp: 15 + Math.random() * 15
}));

const cropDistribution = [
    { name: 'Maïs', value: 400 },
    { name: 'Blé', value: 300 },
    { name: 'Soja', value: 300 },
    { name: 'Colza', value: 200 },
];

const COLORS = ['#00F0FF', '#7B2CBF', '#00FF9D', '#FF9F1C'];

const KPICard = ({ title, value, unit, trend, trendValue, icon: Icon, color }) => (
    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:bg-white/5 transition-all">
        <div className={`absolute top-4 right-4 p-3 rounded-xl bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <h3 className="text-gray-400 font-medium mb-2">{title}</h3>
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            <span className="text-sm text-gray-400">{unit}</span>
        </div>
        <div className={`flex items-center gap-1 mt-4 text-sm ${trend === 'up' ? 'text-neon-green' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span className="font-bold">{trendValue}</span>
            <span className="text-gray-500 ml-1">vs mois dernier</span>
        </div>
    </div>
);

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState('30d');

    return (
        <div className="space-y-6 fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Analyse & Rapports</h1>
                    <p className="text-gray-400">Vue détaillée des performances agricoles</p>
                </div>

                <div className="flex bg-navy-900 rounded-xl p-1 border border-white/10">
                    {['7j', '30d', '3m', '1y'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-neon-blue text-navy-900 shadow-lg shadow-neon-blue/20'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Rendement Total"
                    value="1,245"
                    unit="Tonnes"
                    trend="up"
                    trendValue="+12.5%"
                    icon={Leaf}
                    color="neon-green"
                />
                <KPICard
                    title="Efficacité Eau"
                    value="42.5"
                    unit="L/kg"
                    trend="down"
                    trendValue="-5.2%"
                    icon={Droplets}
                    color="neon-blue"
                />
                <KPICard
                    title="Score Santé Global"
                    value="94"
                    unit="/100"
                    trend="up"
                    trendValue="+2.1%"
                    icon={Activity}
                    color="neon-violet"
                />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Production Goals */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-neon-blue" size={20} />
                        Performance vs Objectifs
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                                />
                                <Bar dataKey="production" name="Production" fill="#00FF9D" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="target" name="Objectif" fill="#334155" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Crop Distribution Pie */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">Répartition Cultures</h3>
                    <div className="flex-1 min-h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={cropDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {cropDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-white">4</span>
                        </div>
                    </div>
                </div>

                {/* Environmental Trends */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
                    <h3 className="text-xl font-bold text-white mb-6">Conditions Environnementales (30J)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={envData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF9F1C" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF9F1C" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="temp" name="Température" stroke="#FF9F1C" fillOpacity={1} fill="url(#colorTemp)" />
                                <Area type="monotone" dataKey="humidity" name="Humidité" stroke="#00F0FF" fillOpacity={1} fill="url(#colorHum)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights - Textual */}
                <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <BrainCircuit className="text-neon-violet" />
                        Insights IA
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-neon-blue/5 border-l-4 border-neon-blue">
                            <p className="text-sm text-gray-300">
                                <span className="text-neon-blue font-bold block mb-1">Optimisation Irrigation</span>
                                L'humidité du sol sur les parcelles de Maïs est supérieure de <strong>15%</strong> à la moyenne. Réduire l'irrigation pourrait économiser 1200L demain.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-neon-green/5 border-l-4 border-neon-green">
                            <p className="text-sm text-gray-300">
                                <span className="text-neon-green font-bold block mb-1">Croissance Exceptionnelle</span>
                                Les parcelles de Soja #4 et #7 montrent une croissance 20% plus rapide que prévu grâce aux températures récentes.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsPage;

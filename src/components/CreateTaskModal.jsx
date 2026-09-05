import React, { useState } from 'react';
import { X, Calendar, User, FileText, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateTaskModal = ({ isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        title: '',
        type: 'maintenance',
        priority: 'medium',
        technician: '',
        date: '',
        description: '',
        zone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
        // Reset form or notify parent
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-navy-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-navy-950/50">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide">Nouvelle Intervention</h2>
                            <p className="text-sm text-gray-400">Planifier une tâche pour les équipes de terrain</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Title & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Titre de la tâche</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ex: Inspection Drone Zone A"
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type d'intervention</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all appearance-none"
                                >
                                    <option value="maintenance">🔧 Maintenance Capteurs</option>
                                    <option value="drone">🚁 Vol de Drone</option>
                                    <option value="soil">🌱 Analyse de Sol</option>
                                    <option value="treatment">💧 Traitement / Arrosage</option>
                                    <option value="inspection">👀 Inspection Visuelle</option>
                                </select>
                            </div>
                        </div>

                        {/* Priority & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Priorité</label>
                                <div className="flex bg-navy-950 rounded-xl p-1 border border-white/10">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: p })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${formData.priority === p
                                                ? p === 'high' ? 'bg-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                                    : p === 'medium' ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                                        : 'bg-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                                : 'text-gray-500 hover:text-gray-300'
                                                }`}
                                        >
                                            {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date d'échéance</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full bg-navy-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all color-scheme-dark"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Zone concernée</label>
                                <select
                                    name="zone"
                                    value={formData.zone}
                                    onChange={handleChange}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="zone1">Zone Nord (Maïs)</option>
                                    <option value="zone2">Zone Est (Blé)</option>
                                    <option value="zone3">Serres Connectées</option>
                                </select>
                            </div>
                        </div>

                        {/* Assignee */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Technicien assigné</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <select
                                    name="technician"
                                    value={formData.technician}
                                    onChange={handleChange}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all appearance-none"
                                >
                                    <option value="">Assigner automatiquement (IA)</option>
                                    <option value="tech1">Dr. Aris Thorne (Spécialiste Drone)</option>
                                    <option value="tech2">Sarah Chen (Agronome)</option>
                                    <option value="tech3">Mike Ross (Maintenance)</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description & Notes</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Détails supplémentaires sur l'intervention..."
                                className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-950 font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                            >
                                Créer la Tâche
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateTaskModal;

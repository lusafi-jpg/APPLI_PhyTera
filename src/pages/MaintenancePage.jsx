import React, { useState, useEffect } from 'react';
import { Wrench, AlertOctagon, CheckCircle2, Clock, Plus, Cpu, UserCheck, Edit, RefreshCw } from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { devicesService } from '../services/devicesService';

export default function MaintenancePage() {
    const [tickets, setTickets] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        deviceId: '',
        title: '',
        issueDescription: '',
        interventionDate: new Date().toISOString().split('T')[0],
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await maintenanceService.getMyInterventions();
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('Backend maintenance endpoint error:', err.message);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function init() {
            fetchTickets();
            try {
                const fetchedDevices = await devicesService.getAllDevices();
                setDevices(Array.isArray(fetchedDevices) ? fetchedDevices : []);
                if (fetchedDevices?.length > 0) {
                    setNewTicket((prev) => ({ ...prev, deviceId: fetchedDevices[0].id }));
                }
            } catch (err) {
                setDevices([{ id: 'dev-1', serialNumber: 'ESP32-PHY-001' }]);
            }
        }
        init();
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newTicket.deviceId || !newTicket.title) return;
        setSubmitting(true);
        try {
            await maintenanceService.createTicket(newTicket);
            setIsModalOpen(false);
            fetchTickets();
        } catch (err) {
            alert(`Erreur création ticket: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (ticketId, status) => {
        const note = prompt('Note de résolution ou d\'intervention:');
        try {
            await maintenanceService.updateTicket(ticketId, { status, resolutionNote: note || '' });
            fetchTickets();
        } catch (err) {
            alert(`Erreur mise à jour: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Wrench className="w-8 h-8 text-neon-blue" />
                        Maintenance & Interventions Techniciens
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Gestion des tickets d'intervention technique, dépannage et maintenance des boîtiers ESP32.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchTickets}
                        className="p-2.5 rounded-xl bg-navy-800 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all"
                        title="Rafraîchir"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-semibold shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 transition-all"
                    >
                        <Plus size={18} />
                        <span>Ouvrir un Ticket</span>
                    </button>
                </div>
            </div>

            {/* Tickets List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-32 rounded-2xl bg-navy-900/50 border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-16 bg-navy-900/30 border border-white/5 rounded-2xl">
                    <Wrench className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white">Aucun ticket de maintenance</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-4">
                        Tous les équipements fonctionnent correctement. Aucun ticket d'intervention ouvert.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map((t) => (
                        <div
                            key={t.id}
                            className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-neon-blue/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${t.status === 'OPEN'
                                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                : t.status === 'IN_PROGRESS'
                                                    ? 'bg-neon-blue/20 text-neon-cyan border-neon-blue/30'
                                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                            }`}
                                    >
                                        {t.status}
                                    </span>
                                    <h3 className="font-semibold text-lg text-white">{t.title}</h3>
                                </div>

                                <p className="text-sm text-gray-300">{t.issueDescription}</p>

                                {t.resolutionNote && (
                                    <p className="text-xs text-neon-cyan bg-navy-950/80 px-3 py-1.5 rounded-lg border border-white/5">
                                        <strong>Note Technicien:</strong> {t.resolutionNote}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                                    <span className="flex items-center gap-1">
                                        <Cpu size={14} className="text-neon-blue" />
                                        {t.device?.serialNumber || 'Boîtier ESP32'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        Intervention: {new Date(t.interventionDate || t.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {t.status !== 'RESOLVED' && (
                                    <button
                                        onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
                                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 size={14} /> Marquer Résolu
                                    </button>
                                )}
                                {t.status === 'OPEN' && (
                                    <button
                                        onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                                        className="px-3.5 py-2 rounded-xl bg-neon-blue/20 border border-neon-blue/40 text-neon-cyan hover:bg-neon-blue/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                                    >
                                        <Clock size={14} /> Prendre en charge
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Ticket */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Wrench className="text-neon-blue" size={20} />
                            Ouvrir un ticket d'intervention
                        </h3>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Boîtier concerné *</label>
                                <select
                                    value={newTicket.deviceId}
                                    onChange={(e) => setNewTicket({ ...newTicket, deviceId: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                >
                                    {devices.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.serialNumber || d.id}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Titre du ticket *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Remplacement du capteur pH"
                                    value={newTicket.title}
                                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description du problème</label>
                                <textarea
                                    rows={3}
                                    placeholder="Description détaillée..."
                                    value={newTicket.issueDescription}
                                    onChange={(e) => setNewTicket({ ...newTicket, issueDescription: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-navy-800 text-gray-300 hover:text-white"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold hover:shadow-lg transition-all"
                                >
                                    {submitting ? 'Création...' : 'Créer le Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

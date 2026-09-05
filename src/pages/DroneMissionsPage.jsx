import React, { useState, useEffect } from 'react';
import { Disc, Layers, Plus, Calendar, User, Activity, Map, RefreshCw, CheckCircle, Flame, Eye } from 'lucide-react';
import { droneService } from '../services/droneService';
import { fieldsService } from '../services/fieldsService';

export default function DroneMissionsPage() {
    const [missions, setMissions] = useState([]);
    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMission, setNewMission] = useState({
        fieldId: '',
        pilotName: 'Capitaine Agro-Drone',
        ndviMapUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
        thermalMapUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=800&auto=format&fit=crop',
        status: 'COMPLETED',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadFields() {
            setLoading(true);
            try {
                const fetchedFields = await fieldsService.getFields();
                setFields(Array.isArray(fetchedFields) ? fetchedFields : []);
                if (fetchedFields?.length > 0) {
                    setSelectedFieldId(fetchedFields[0].id);
                    setNewMission((prev) => ({ ...prev, fieldId: fetchedFields[0].id }));
                }
            } catch (err) {
                setFields([{ id: 'field-1', name: 'Parcelle Sud - Maïs' }]);
                setSelectedFieldId('field-1');
            } finally {
                setLoading(false);
            }
        }
        loadFields();
    }, []);

    const fetchMissions = async (fieldId) => {
        if (!fieldId) return;
        setLoading(true);
        try {
            const data = await droneService.getFieldDroneMissions(fieldId);
            setMissions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('Backend drone missions endpoint error, fallback to mock data');
            setMissions([
                {
                    id: 'drone-m1',
                    fieldId: fieldId,
                    flightDate: new Date().toISOString(),
                    pilotName: 'Jean Technicien (Pilote Certifié DGAC)',
                    status: 'COMPLETED',
                    ndviMapUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
                    thermalMapUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=800&auto=format&fit=crop',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedFieldId) {
            fetchMissions(selectedFieldId);
        }
    }, [selectedFieldId]);

    const handleCreateMission = async (e) => {
        e.preventDefault();
        if (!newMission.fieldId) return;
        setSubmitting(true);
        try {
            await droneService.createDroneMission(newMission);
            setIsModalOpen(false);
            fetchMissions(selectedFieldId);
        } catch (err) {
            alert(`Erreur création mission: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Disc className="w-8 h-8 text-neon-blue animate-spin-slow" />
                        Cartographie & Survol Drones Multispectraux
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Visualisation des cartes de végétation NDVI et des gradients de température thermique.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedFieldId}
                        onChange={(e) => setSelectedFieldId(e.target.value)}
                        className="bg-navy-900 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neon-blue"
                    >
                        {fields.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-semibold shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 transition-all"
                    >
                        <Plus size={18} />
                        <span>Enregistrer un Survol</span>
                    </button>
                </div>
            </div>

            {/* Missions Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-96 rounded-2xl bg-navy-900/50 border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : missions.length === 0 ? (
                <div className="text-center py-16 bg-navy-900/30 border border-white/5 rounded-2xl">
                    <Disc className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white">Aucun survol de drone</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-4">
                        Aucun survol enregistré pour ce champ. Planifiez un survol drone pour générer une carte NDVI.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-neon-blue/20 border border-neon-blue/40 text-neon-cyan rounded-xl hover:bg-neon-blue/30 transition-all"
                    >
                        + Enregistrer une mission
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {missions.map((m) => (
                        <div
                            key={m.id}
                            className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-neon-blue/40 transition-all space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue">
                                        <Disc size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Mission #{m.id.slice(0, 8)}</h3>
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <User size={12} className="text-neon-cyan" /> {m.pilotName || 'Pilote Automatique'}
                                        </span>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle size={12} /> {m.status}
                                </span>
                            </div>

                            {/* Maps Dual View */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs text-neon-cyan font-semibold">
                                        <span className="flex items-center gap-1"><Layers size={13} /> Carte NDVI (Végétation)</span>
                                    </div>
                                    <div className="h-44 rounded-xl overflow-hidden border border-white/10 relative group">
                                        <img src={m.ndviMapUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop'} alt="NDVI Map" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-emerald-400 font-mono">NDVI: 0.76 (Sain)</div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                                        <span className="flex items-center gap-1"><Flame size={13} /> Carte Thermique</span>
                                    </div>
                                    <div className="h-44 rounded-xl overflow-hidden border border-white/10 relative group">
                                        <img src={m.thermalMapUrl || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=800&auto=format&fit=crop'} alt="Thermal Map" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-amber-400 font-mono">Temp Sol: 28.4°C</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-white/5">
                                <span className="flex items-center gap-1">
                                    <Calendar size={13} /> {new Date(m.flightDate).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="text-neon-cyan cursor-pointer hover:underline flex items-center gap-1">
                                    <Eye size={13} /> Exporter le rapport PDF
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Add Mission */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Disc className="text-neon-blue" size={20} />
                            Enregistrer un survol de drone
                        </h3>
                        <form onSubmit={handleCreateMission} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Parcelle survolée *</label>
                                <select
                                    value={newMission.fieldId}
                                    onChange={(e) => setNewMission({ ...newMission, fieldId: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                >
                                    {fields.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Pilote / Opérateur</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Jean Dupont (Drone Tech)"
                                    value={newMission.pilotName}
                                    onChange={(e) => setNewMission({ ...newMission, pilotName: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">URL Carte NDVI (Végétation)</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={newMission.ndviMapUrl}
                                    onChange={(e) => setNewMission({ ...newMission, ndviMapUrl: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">URL Carte Thermique</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={newMission.thermalMapUrl}
                                    onChange={(e) => setNewMission({ ...newMission, thermalMapUrl: e.target.value })}
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
                                    {submitting ? 'Enregistrement...' : 'Enregistrer la Mission'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

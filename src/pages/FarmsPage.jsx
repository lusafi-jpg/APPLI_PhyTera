import React, { useState, useEffect } from 'react';
import { Tractor, MapPin, Plus, Trash2, Edit3, Building, RefreshCw, Layers } from 'lucide-react';
import { farmsService } from '../services/farmsService';

export default function FarmsPage() {
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFarm, setNewFarm] = useState({ name: '', location: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchFarms = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await farmsService.getAllFarms();
            setFarms(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('Backend farms endpoint error:', err.message);
            setError('Impossible de se connecter au serveur backend NestJS.');
            setFarms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarms();
    }, []);

    const handleCreateFarm = async (e) => {
        e.preventDefault();
        if (!newFarm.name) return;
        setSubmitting(true);
        try {
            await farmsService.createFarm(newFarm);
            setNewFarm({ name: '', location: '', description: '' });
            setIsModalOpen(false);
            fetchFarms();
        } catch (err) {
            alert(`Erreur création: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteFarm = async (id) => {
        if (!confirm('Voulez-vous vraiment supprimer cette exploitation ?')) return;
        try {
            await farmsService.deleteFarm(id);
            fetchFarms();
        } catch (err) {
            alert(`Erreur suppression: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Tractor className="w-8 h-8 text-neon-blue" />
                        Exploitations Agricoles (Farms)
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Gérez vos domaines agricoles et associez-y vos parcelles et dispositifs IoT NestJS.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchFarms}
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
                        <span>Nouvelle Exploitation</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center justify-between">
                    <span>{error} - Affichage du mode simulation hors-ligne.</span>
                    <button onClick={fetchFarms} className="underline text-amber-200">Réessayer</button>
                </div>
            )}

            {/* Farms Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-48 rounded-2xl bg-navy-900/50 border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : farms.length === 0 ? (
                <div className="text-center py-16 bg-navy-900/30 border border-white/5 rounded-2xl">
                    <Building className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white">Aucune exploitation</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-4">
                        Vous n'avez pas encore créé d'exploitation agricole. Créez-en une pour y rattacher vos parcelles.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-neon-blue/20 border border-neon-blue/40 text-neon-cyan rounded-xl hover:bg-neon-blue/30 transition-all"
                    >
                        + Créer ma première exploitation
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {farms.map((farm) => (
                        <div
                            key={farm.id}
                            className="group relative bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-neon-blue/40 transition-all hover:shadow-xl hover:shadow-neon-blue/5"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue">
                                        <Tractor size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white group-hover:text-neon-cyan transition-colors">
                                            {farm.name}
                                        </h3>
                                        {farm.location && (
                                            <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                <MapPin size={13} className="text-neon-cyan" />
                                                {farm.location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteFarm(farm.id)}
                                    className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                                    title="Supprimer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <p className="text-sm text-gray-300 mt-4 line-clamp-2">
                                {farm.description || 'Aucune description fournie pour cette exploitation.'}
                            </p>

                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <Layers size={14} className="text-neon-blue" />
                                    {farm.fields?.length || 0} Parcelle(s) active(s)
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                                    ID: {farm.id.slice(0, 8)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal New Farm */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Tractor className="text-neon-blue" size={20} />
                            Ajouter une Exploitation
                        </h3>
                        <form onSubmit={handleCreateFarm} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Nom de l'exploitation *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Domaine Agro-Tech Maluku"
                                    value={newFarm.name}
                                    onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Localisation / Région</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Kinshasa, RDC"
                                    value={newFarm.location}
                                    onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Détails de l'exploitation..."
                                    value={newFarm.description}
                                    onChange={(e) => setNewFarm({ ...newFarm, description: e.target.value })}
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
                                    {submitting ? 'Création...' : 'Créer l\'exploitation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

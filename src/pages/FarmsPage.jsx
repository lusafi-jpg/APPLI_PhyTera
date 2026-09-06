import React, { useState, useEffect } from 'react';
import { 
    Tractor, MapPin, Plus, Trash2, Edit3, Building, RefreshCw, Layers, 
    Sprout, ChevronDown, ChevronUp, Map, CheckCircle2, AlertCircle, 
    Settings, ExternalLink, Info, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { farmsService } from '../services/farmsService';
import { fieldsService } from '../services/fieldsService';
import { getApiBaseUrl, setCustomApiUrl } from '../services/api';

const CULTURE_OPTIONS = [
    { label: 'Maïs (Céréale)', value: 'Maïs' },
    { label: 'Manioc (Tubercule)', value: 'Manioc' },
    { label: 'Soja (Légumineuse)', value: 'Soja' },
    { label: 'Tomates & Maraîchage', value: 'Tomate' },
    { label: 'Riz de bas-fond', value: 'Riz' },
    { label: 'Haricots & Niébé', value: 'Haricot' },
    { label: 'Verger & Agrumes', value: 'Agrumes' },
    { label: 'Bananes & Plantains', value: 'Banane' },
    { label: 'Café / Cacao', value: 'Café' },
    { label: 'Autre culture', value: 'Autre' },
];

export default function FarmsPage() {
    const navigate = useNavigate();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [notification, setNotification] = useState(null);

    // Modal Nouvelle Exploitation
    const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
    const [newFarm, setNewFarm] = useState({ name: '', location: '', description: '' });
    const [submittingFarm, setSubmittingFarm] = useState(false);

    // Modal Nouveau Champ / Parcelle
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [newField, setNewField] = useState({
        farmId: '',
        name: '',
        cultureType: 'Maïs',
        variety: '',
        surfaceArea: '2.5',
    });
    const [submittingField, setSubmittingField] = useState(false);

    // Modal Config Backend
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [apiUrlInput, setApiUrlInput] = useState(getApiBaseUrl());

    // Expand / collapse fields for each farm
    const [expandedFarms, setExpandedFarms] = useState({});

    const notify = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const fetchFarms = async () => {
        setLoading(true);
        try {
            const data = await farmsService.getAllFarms();
            const farmList = Array.isArray(data) ? data : [];
            setFarms(farmList);
            setIsOfflineMode(farmList.some(f => f.isLocal) || localStorage.getItem('phytera_farms_data') !== null);
        } catch (err) {
            console.warn('Backend farms endpoint error:', err.message);
            setIsOfflineMode(true);
            const fallback = await farmsService.getAllFarms();
            setFarms(fallback);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarms();
    }, []);

    // Créer une exploitation
    const handleCreateFarm = async (e) => {
        e.preventDefault();
        if (!newFarm.name?.trim()) {
            notify('error', 'Veuillez saisir le nom de l\'exploitation.');
            return;
        }

        setSubmittingFarm(true);
        try {
            const created = await farmsService.createFarm(newFarm);
            setNewFarm({ name: '', location: '', description: '' });
            setIsFarmModalOpen(false);
            await fetchFarms();
            notify('success', `Exploitation "${created.name}" créée avec succès !`);
        } catch (err) {
            notify('error', `Erreur création: ${err.message}`);
        } finally {
            setSubmittingFarm(false);
        }
    };

    // Supprimer une exploitation
    const handleDeleteFarm = async (id, name) => {
        if (!window.confirm(`Supprimer l'exploitation "${name}" et ses parcelles ?`)) return;
        try {
            await farmsService.deleteFarm(id);
            await fetchFarms();
            notify('info', `Exploitation "${name}" supprimée.`);
        } catch (err) {
            notify('error', `Erreur suppression: ${err.message}`);
        }
    };

    // Ouvrir la modal d'ajout de champ pour une exploitation précise
    const handleOpenFieldModal = (farmId = '') => {
        const targetFarmId = farmId || (farms.length > 0 ? farms[0].id : '');
        setNewField({
            farmId: targetFarmId,
            name: '',
            cultureType: 'Maïs',
            variety: '',
            surfaceArea: '2.5',
        });
        setIsFieldModalOpen(true);
    };

    // Créer un champ / parcelle
    const handleCreateField = async (e) => {
        e.preventDefault();
        if (!newField.name?.trim()) {
            notify('error', 'Veuillez renseigner le nom du champ ou de la parcelle.');
            return;
        }

        if (!newField.farmId && farms.length > 0) {
            newField.farmId = farms[0].id;
        }

        setSubmittingField(true);
        try {
            const created = await fieldsService.createField({
                ...newField,
                surfaceArea: parseFloat(newField.surfaceArea) || 1.0,
            });

            // Déplier automatiquement la ferme correspondante pour voir le nouveau champ
            if (newField.farmId) {
                setExpandedFarms((prev) => ({ ...prev, [newField.farmId]: true }));
            }

            setIsFieldModalOpen(false);
            await fetchFarms();
            notify('success', `Champ "${created.name}" (${newField.cultureType}) ajouté avec succès !`);
        } catch (err) {
            notify('error', `Erreur lors de l'ajout du champ: ${err.message}`);
        } finally {
            setSubmittingField(false);
        }
    };

    // Supprimer un champ
    const handleDeleteField = async (fieldId, fieldName) => {
        if (!window.confirm(`Supprimer le champ "${fieldName}" ?`)) return;
        try {
            await fieldsService.deleteField(fieldId);
            await fetchFarms();
            notify('info', `Champ "${fieldName}" supprimé.`);
        } catch (err) {
            notify('error', `Erreur suppression champ: ${err.message}`);
        }
    };

    const toggleFarmExpand = (farmId) => {
        setExpandedFarms((prev) => ({
            ...prev,
            [farmId]: !prev[farmId],
        }));
    };

    const handleSaveApiUrl = (e) => {
        e.preventDefault();
        setCustomApiUrl(apiUrlInput);
        setIsConfigModalOpen(false);
        notify('success', 'URL API mise à jour ! Rechargement des données...');
        setTimeout(() => {
            fetchFarms();
        }, 300);
    };

    const totalFieldsCount = farms.reduce((acc, f) => acc + (f.fields?.length || 0), 0);

    return (
        <div className="space-y-6">
            {/* Notification Toast */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 ${
                        notification.type === 'success'
                            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                            : notification.type === 'error'
                            ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                            : 'bg-navy-900/95 border-neon-blue/40 text-neon-cyan'
                    }`}
                >
                    {notification.type === 'success' && <CheckCircle2 size={20} className="text-emerald-400" />}
                    {notification.type === 'error' && <AlertCircle size={20} className="text-rose-400" />}
                    {notification.type === 'info' && <Info size={20} className="text-neon-cyan" />}
                    <span className="text-sm font-medium">{notification.text}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Tractor className="w-8 h-8 text-neon-blue" />
                        Exploitations & Champs (Farms)
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Gérez vos domaines agricoles, découpez-les en champs cultivables et visualisez-les sur carte satellite.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={fetchFarms}
                        className="p-2.5 rounded-xl bg-navy-900/80 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all shadow-sm"
                        title="Rafraîchir les données"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="p-2.5 rounded-xl bg-navy-900/80 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all"
                        title="Configuration API"
                    >
                        <Settings size={18} />
                    </button>

                    <button
                        onClick={() => handleOpenFieldModal()}
                        disabled={farms.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-neon-green/30 text-neon-green font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sprout size={17} />
                        <span>+ Nouveau Champ</span>
                    </button>

                    <button
                        onClick={() => setIsFarmModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-950 font-bold shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 transition-all"
                    >
                        <Plus size={18} />
                        <span>+ Nouvelle Exploitation</span>
                    </button>
                </div>
            </div>

            {/* Status & Stats Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-navy-900/40 border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse" />
                    <span>
                        <strong>{farms.length}</strong> exploitation{farms.length > 1 ? 's' : ''} •{' '}
                        <strong>{totalFieldsCount}</strong> champ{totalFieldsCount > 1 ? 's' : ''} actif{totalFieldsCount > 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-500 hidden md:inline">|</span>
                    <span className="text-gray-400 hidden md:inline flex items-center gap-1">
                        <ShieldCheck size={14} className="text-neon-cyan inline" /> Sauvegarde locale persistante active
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/fields')}
                        className="text-xs text-neon-cyan hover:underline flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <Map size={13} /> Voir la carte satellite
                    </button>
                </div>
            </div>

            {/* Farms Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-56 rounded-2xl bg-navy-900/50 border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : farms.length === 0 ? (
                <div className="text-center py-16 px-4 bg-navy-900/30 border border-white/5 rounded-3xl backdrop-blur-md">
                    <Building className="w-14 h-14 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">Aucune exploitation agricole</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mt-1.5 mb-6">
                        Commencez par créer votre première exploitation pour y ajouter des champs (parcelles) et y installer vos boîtiers IoT.
                    </p>
                    <button
                        onClick={() => setIsFarmModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-950 font-bold rounded-2xl hover:shadow-xl hover:shadow-neon-blue/20 transition-all text-sm"
                    >
                        + Créer ma première exploitation
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {farms.map((farm) => {
                        const fieldsList = farm.fields || [];
                        const isExpanded = expandedFarms[farm.id];

                        return (
                            <div
                                key={farm.id}
                                className="group relative bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-neon-blue/40 transition-all hover:shadow-xl hover:shadow-neon-blue/5 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Card Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue shrink-0">
                                                <Tractor size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-white group-hover:text-neon-cyan transition-colors">
                                                    {farm.name}
                                                </h3>
                                                {farm.location && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                                        <MapPin size={13} className="text-neon-cyan shrink-0" />
                                                        {farm.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteFarm(farm.id, farm.name)}
                                            className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                                            title="Supprimer cette exploitation"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs sm:text-sm text-gray-300 mt-3.5 line-clamp-2">
                                        {farm.description || 'Aucune description fournie pour cette exploitation.'}
                                    </p>

                                    {/* Fields List (Accordion) */}
                                    <div className="mt-4 pt-3 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => toggleFarmExpand(farm.id)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-neon-blue hover:text-neon-cyan transition-colors"
                                            >
                                                <Layers size={14} />
                                                <span>{fieldsList.length} Champ{fieldsList.length > 1 ? 's' : ''} (Parcelle{fieldsList.length > 1 ? 's' : ''})</span>
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>

                                            <button
                                                onClick={() => handleOpenFieldModal(farm.id)}
                                                className="text-xs px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green hover:bg-neon-green/20 border border-neon-green/30 flex items-center gap-1 transition-all"
                                                title="Ajouter un champ à cette exploitation"
                                            >
                                                <Plus size={12} />
                                                <span>Ajouter un champ</span>
                                            </button>
                                        </div>

                                        {/* Expanded Fields */}
                                        {isExpanded && (
                                            <div className="mt-3 space-y-2 bg-navy-950/60 rounded-xl p-2.5 border border-white/5">
                                                {fieldsList.length === 0 ? (
                                                    <div className="text-center py-3 text-xs text-gray-400">
                                                        <p>Aucun champ enregistré pour cette exploitation.</p>
                                                        <button
                                                            onClick={() => handleOpenFieldModal(farm.id)}
                                                            className="mt-2 text-neon-cyan underline text-xs font-semibold"
                                                        >
                                                            + Ajouter un premier champ
                                                        </button>
                                                    </div>
                                                ) : (
                                                    fieldsList.map((field) => (
                                                        <div
                                                            key={field.id}
                                                            className="flex items-center justify-between p-2 rounded-lg bg-navy-900/80 border border-white/5 hover:border-white/10 text-xs"
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Sprout size={14} className="text-neon-green shrink-0" />
                                                                <div className="truncate">
                                                                    <span className="font-semibold text-white block truncate">
                                                                        {field.name}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400">
                                                                        {field.cultureType || 'Vivrier'} • {field.surfaceArea || 1} ha
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                                <button
                                                                    onClick={() => navigate('/fields')}
                                                                    className="p-1 rounded text-gray-400 hover:text-neon-cyan hover:bg-white/5"
                                                                    title="Voir sur la carte"
                                                                >
                                                                    <ExternalLink size={13} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteField(field.id, field.name)}
                                                                    className="p-1 rounded text-gray-500 hover:text-rose-400 hover:bg-white/5"
                                                                    title="Supprimer ce champ"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Card ID */}
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                                    <span className="uppercase tracking-wider">
                                        ID: {farm.id.slice(0, 8)}
                                    </span>
                                    {farm.isLocal && (
                                        <span className="text-neon-green/80 font-mono text-[10px] bg-neon-green/10 px-2 py-0.5 rounded-full">
                                            Stocké localement
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL 1: Ajouter une Exploitation */}
            {isFarmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Tractor className="text-neon-blue" size={22} />
                                Ajouter une Exploitation
                            </h3>
                            <button
                                onClick={() => setIsFarmModalOpen(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateFarm} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Nom de l'exploitation *
                                </label>
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
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Localisation / Région
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Maluku, Kinshasa, RDC"
                                    value={newFarm.location}
                                    onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Description & Remarques
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Ex: Cultures maraîchères, maïs sous pivot d'irrigation et verger..."
                                    value={newFarm.description}
                                    onChange={(e) => setNewFarm({ ...newFarm, description: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsFarmModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-navy-800 text-gray-300 hover:text-white transition-all text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingFarm}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-950 font-bold hover:shadow-lg transition-all text-sm"
                                >
                                    {submittingFarm ? 'Enregistrement...' : 'Créer l\'exploitation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Ajouter un Champ / Parcelle */}
            {isFieldModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sprout className="text-neon-green" size={22} />
                                Ajouter un Champ / Parcelle
                            </h3>
                            <button
                                onClick={() => setIsFieldModalOpen(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateField} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Exploitation de rattachement *
                                </label>
                                <select
                                    required
                                    value={newField.farmId}
                                    onChange={(e) => setNewField({ ...newField, farmId: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green"
                                >
                                    {farms.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.location || 'Sans région'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Nom du Champ / de la Parcelle *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Champ Nord - Maïs Hybride"
                                    value={newField.name}
                                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                        Type de culture
                                    </label>
                                    <select
                                        value={newField.cultureType}
                                        onChange={(e) => setNewField({ ...newField, cultureType: e.target.value })}
                                        className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green"
                                    >
                                        {CULTURE_OPTIONS.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                        Superficie (ha)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        placeholder="Ex: 4.5"
                                        value={newField.surfaceArea}
                                        onChange={(e) => setNewField({ ...newField, surfaceArea: e.target.value })}
                                        className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    Variété cultivée (Optionnel)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Pioneer P3406 / Sawasa locale"
                                    value={newField.variety}
                                    onChange={(e) => setNewField({ ...newField, variety: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsFieldModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-navy-800 text-gray-300 hover:text-white transition-all text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingField}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-navy-950 font-bold hover:shadow-lg transition-all text-sm"
                                >
                                    {submittingField ? 'Création...' : 'Créer le Champ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: Configuration Backend API */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Settings className="text-neon-blue" size={20} />
                                Configuration de l'API Backend
                            </h3>
                            <button
                                onClick={() => setIsConfigModalOpen(false)}
                                className="text-gray-400 hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed">
                            Si vous avez déployé le backend NestJS sur le cloud (Render, Railway, Fly.io) avec PostgreSQL, vous pouvez renseigner ici l'URL HTTPS publique de votre API.
                        </p>

                        <form onSubmit={handleSaveApiUrl} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                    URL de l'API
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: https://phytera-api.onrender.com"
                                    value={apiUrlInput}
                                    onChange={(e) => setApiUrlInput(e.target.value)}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue font-mono text-xs"
                                />
                                <span className="text-[11px] text-gray-500 mt-1 block">
                                    Par défaut: http://localhost:3000 (Mode hors-ligne actif si non joignable).
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setApiUrlInput('http://localhost:3000');
                                        setCustomApiUrl(null);
                                        notify('info', 'Réinitialisé à l\'URL par défaut.');
                                    }}
                                    className="text-xs text-gray-400 hover:underline"
                                >
                                    Réinitialiser par défaut
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-neon-blue text-navy-950 font-bold hover:bg-neon-cyan transition-all text-xs"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

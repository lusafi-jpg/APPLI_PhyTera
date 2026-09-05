import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Upload, CheckCircle2, AlertTriangle, RefreshCw, Filter, Smartphone, Disc, ShieldCheck } from 'lucide-react';
import { cropImagesService } from '../services/cropImagesService';
import { fieldsService } from '../services/fieldsService';

export default function CropAnalysisPage() {
    const [images, setImages] = useState([]);
    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newImage, setNewImage] = useState({
        fieldId: '',
        imageUrl: '',
        source: 'SMARTPHONE',
        aiDiagnosis: '',
        confidenceScore: 0.88,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function initData() {
            setLoading(true);
            try {
                const fetchedFields = await fieldsService.getFields();
                setFields(Array.isArray(fetchedFields) ? fetchedFields : []);
                if (fetchedFields?.length > 0) {
                    setSelectedFieldId(fetchedFields[0].id);
                    setNewImage((prev) => ({ ...prev, fieldId: fetchedFields[0].id }));
                }
            } catch (err) {
                console.warn('Backend fields unavailable:', err.message);
                setFields([]);
                setSelectedFieldId('');
            } finally {
                setLoading(false);
            }
        }
        initData();
    }, []);

    const fetchCropImages = async (fieldId) => {
        if (!fieldId) {
            setImages([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await cropImagesService.getFieldImages(fieldId);
            setImages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('Backend crop images endpoint error:', err.message);
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedFieldId) {
            fetchCropImages(selectedFieldId);
        }
    }, [selectedFieldId]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newImage.imageUrl || !newImage.fieldId) return;
        setSubmitting(true);
        try {
            await cropImagesService.uploadImage(newImage);
            setIsModalOpen(false);
            fetchCropImages(selectedFieldId);
        } catch (err) {
            alert(`Erreur téléversement: ${err.message}`);
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
                        <Sparkles className="w-8 h-8 text-neon-blue animate-pulse" />
                        Diagnostic & Imagerie par Intelligence Artificielle
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Analyse automatisée des pathologies végétales (Mildiou, Oïdium, carences) par vision IA NestJS.
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
                        <Upload size={18} />
                        <span>Ajouter une Photo</span>
                    </button>
                </div>
            </div>

            {/* Grid of Diagnosed Images */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-80 rounded-2xl bg-navy-900/50 border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : images.length === 0 ? (
                <div className="text-center py-16 bg-navy-900/30 border border-white/5 rounded-2xl">
                    <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white">Aucune image analysée</h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-4">
                        Téléversez une photo smartphone ou drone pour lancer la détection IA de maladies du champ.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-neon-blue/20 border border-neon-blue/40 text-neon-cyan rounded-xl hover:bg-neon-blue/30 transition-all"
                    >
                        + Téléverser une photo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="bg-navy-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-neon-blue/40 transition-all group"
                        >
                            <div className="relative h-48 overflow-hidden bg-navy-950">
                                <img
                                    src={img.imageUrl}
                                    alt="Crop diagnostic"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy-950/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-neon-cyan flex items-center gap-1.5">
                                    {img.source === 'DRONE' ? <Disc size={13} /> : <Smartphone size={13} />}
                                    {img.source}
                                </div>
                                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md text-xs font-semibold text-emerald-300">
                                    {img.status}
                                </div>
                            </div>

                            <div className="p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-neon-blue flex items-center gap-1">
                                        <Sparkles size={14} /> Diagnostic IA
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(img.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>

                                <p className="text-sm text-white font-medium">
                                    {img.aiDiagnosis || 'Analyse en cours par l\'algorithme agronomique...'}
                                </p>

                                {img.confidenceScore && (
                                    <div className="space-y-1 pt-2">
                                        <div className="flex justify-between text-xs text-gray-400 font-medium">
                                            <span>Confiance IA</span>
                                            <span className="text-neon-cyan">{Math.round(img.confidenceScore * 100)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full transition-all duration-1000"
                                                style={{ width: `${img.confidenceScore * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Add Photo */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Camera className="text-neon-blue" size={20} />
                            Téléverser une image de culture
                        </h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Parcelle *</label>
                                <select
                                    value={newImage.fieldId}
                                    onChange={(e) => setNewImage({ ...newImage, fieldId: e.target.value })}
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
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">URL de la photo *</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={newImage.imageUrl}
                                    onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Source de l'imagerie</label>
                                <select
                                    value={newImage.source}
                                    onChange={(e) => setNewImage({ ...newImage, source: e.target.value })}
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon-blue"
                                >
                                    <option value="SMARTPHONE">Smartphone Agriculteur</option>
                                    <option value="DRONE">Survol Drone Multispectral</option>
                                    <option value="CAMERA">Caméra Fixe Connectée</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Diagnostic pré-renseigné / Observation</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Taches foliaires suspectes..."
                                    value={newImage.aiDiagnosis}
                                    onChange={(e) => setNewImage({ ...newImage, aiDiagnosis: e.target.value })}
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
                                    {submitting ? 'Analyse...' : 'Soumettre pour Analyse IA'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

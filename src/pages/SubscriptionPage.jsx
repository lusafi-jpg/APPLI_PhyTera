import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, Sprout, Drone, RefreshCw } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';

const plans = [
    {
        id: 'STANDARD',
        name: 'Standard',
        icon: Sprout,
        color: 'text-neon-green',
        borderColor: 'border-neon-green/30',
        bgGradient: 'from-neon-green/10 to-transparent',
        area: '~150 m²',
        priceMonth: 5,
        priceSeason: 20,
        features: [
            'IoT + IA de base',
            'Cartographie simplifiée',
            'Données collectives (Météo/Sols)',
            'Cartes régionales mutualisées',
            '1 survol de drone / saison',
        ],
    },
    {
        id: 'PRO',
        name: 'Pro',
        icon: Zap,
        color: 'text-neon-blue',
        borderColor: 'border-neon-blue/50',
        bgGradient: 'from-neon-blue/20 to-transparent',
        area: '150–500 m²',
        priceMonth: 10,
        priceSeason: 40,
        popular: true,
        features: [
            'IoT + IA avancée',
            'Cartographie détaillée',
            'Recommandations personnalisées',
            'Analyse parcellaire fine',
            '2 survols de drone / saison',
        ],
    },
    {
        id: 'PREMIUM',
        name: 'Premium',
        icon: Crown,
        color: 'text-neon-violet',
        borderColor: 'border-neon-violet/50',
        bgGradient: 'from-neon-violet/20 to-transparent',
        area: '≥500 m²',
        priceMonth: 25,
        priceSeason: 100,
        features: [
            'IoT + IA complète',
            'Cartographie multispectrale',
            'Suivi drone à la demande',
            'Rapports de rendement précis',
            'Assistance prioritaire 24/7',
        ],
    },
];

const SubscriptionPage = () => {
    const [billingCycle, setBillingCycle] = useState('month');
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchSubscription = async () => {
        setLoading(true);
        try {
            const data = await subscriptionService.getMySubscription();
            setCurrentSubscription(data);
        } catch (err) {
            console.warn('Backend subscription endpoint unavailable, demo fallback.');
            setCurrentSubscription({ plan: 'PRO', status: 'ACTIVE' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    const handleSubscribe = async (planId) => {
        setSubmitting(true);
        try {
            await subscriptionService.subscribe(planId);
            fetchSubscription();
        } catch (err) {
            alert(`Erreur abonnement: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fade-in pb-10 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
                <h2 className="text-4xl font-bold text-white">Gestion de l'Abonnement</h2>
                <p className="text-gray-400 text-sm">
                    Abonnement agronomique PHYTERA connecté directement aux micro-paiements et au contrôleur NestJS.
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center pt-4 gap-4">
                    <span className={`text-sm font-bold ${billingCycle === 'month' ? 'text-white' : 'text-gray-500'}`}>Mensuel</span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'month' ? 'season' : 'month')}
                        className="w-14 h-8 bg-navy-800 rounded-full relative border border-white/10 transition-colors"
                    >
                        <div
                            className={`absolute top-1 left-1 w-6 h-6 bg-neon-blue rounded-full transition-transform duration-300 ${billingCycle === 'season' ? 'translate-x-6' : ''
                                }`}
                        />
                    </button>
                    <span className={`text-sm font-bold ${billingCycle === 'season' ? 'text-white' : 'text-gray-500'}`}>
                        Par Saison <span className="text-neon-green text-xs font-normal ml-1">(-20%)</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {plans.map((plan) => {
                    const price = billingCycle === 'month' ? plan.priceMonth : plan.priceSeason;
                    const isCurrent = currentSubscription?.plan === plan.id;
                    const Icon = plan.icon;

                    return (
                        <div
                            key={plan.id}
                            className={`
                relative glass-panel rounded-3xl p-8 flex flex-col border transition-all duration-300 hover:scale-105 bg-navy-900/70 backdrop-blur-xl
                ${plan.borderColor}
                ${plan.popular ? 'shadow-2xl shadow-neon-blue/10 bg-gradient-to-b from-navy-800/80 to-navy-900/90' : ''}
              `}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neon-blue text-navy-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                                    Recommandé
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.bgGradient} flex items-center justify-center mb-6`}>
                                <Icon className={`w-8 h-8 ${plan.color}`} />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                            <div className="text-xs font-medium text-gray-400 mb-6 bg-white/5 px-3 py-1 rounded-lg w-fit">
                                {plan.area}
                            </div>

                            <div className="flex items-end gap-1 mb-1">
                                <span className={`text-4xl font-bold ${plan.color}`}>${price}</span>
                                <span className="text-gray-500 mb-1 text-sm font-medium">/ {billingCycle === 'month' ? 'mois' : 'saison'}</span>
                            </div>
                            <p className="text-gray-500 text-xs mb-6">Facturé {billingCycle === 'month' ? 'tous les mois' : 'au début de saison'}</p>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={isCurrent || submitting}
                                className={`
                  w-full py-3 rounded-xl font-bold text-sm mb-6 transition-all
                  ${isCurrent
                                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 cursor-default'
                                        : plan.popular
                                            ? 'bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 hover:shadow-lg'
                                            : 'bg-navy-800 hover:bg-white/10 text-white border border-white/10'
                                    }
                `}
                            >
                                {isCurrent ? 'Plan Actuel' : submitting ? 'Traitement...' : 'Choisir ce plan'}
                            </button>

                            <div className="space-y-3 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <Check size={16} className={`${plan.color} shrink-0 mt-0.5`} />
                                        <span className="text-gray-300 text-xs leading-relaxed">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionPage;

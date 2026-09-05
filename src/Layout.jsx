import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    Map as MapIcon,
    Bell,
    Cpu,
    Tractor,
    Sparkles,
    Disc,
    Wrench,
    ShieldCheck,
    Plus,
    Search,
    Settings,
    Menu,
    CreditCard,
    LogOut
} from 'lucide-react';
import Logo from './components/Logo';
import NotificationPanel from './components/NotificationPanel';
import CreateTaskModal from './components/CreateTaskModal';
import { authService } from './services/authService';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 mb-0.5 group
      ${isActive || active
                ? 'bg-gradient-to-r from-neon-blue/10 to-transparent border-l-2 border-neon-blue text-white font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
    `}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-neon-blue' : 'group-hover:text-neon-blue transition-colors'}`} />
        <span className="text-sm tracking-wide">{label}</span>
    </NavLink>
);

const Layout = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [user, setUser] = useState({ nom: 'Mama Hélène', role: 'AGRICULTEUR' });
    const notificationButtonRef = useRef(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) { }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationButtonRef.current && !notificationButtonRef.current.contains(event.target) && !event.target.closest('.notification-panel')) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full bg-navy-950 text-white font-sans overflow-hidden">
            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-navy-900/95 backdrop-blur-xl border-r border-white/5 
        transform transition-transform duration-300 md:transform-none flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo Area */}
                <div className="p-6 pb-4">
                    <Logo size="md" showText={true} />
                    <span className="text-[10px] text-neon-cyan uppercase tracking-widest font-semibold ml-[52px] -mt-1 block">Agro Intelligence</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-1 scrollbar-hide">
                    <div className="mb-2 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Menu Principal</div>
                    <SidebarItem to="/" icon={LayoutDashboard} label="Tableau de Bord" />
                    <SidebarItem to="/farms" icon={Tractor} label="Exploitations" />
                    <SidebarItem to="/fields" icon={MapIcon} label="Parcelles" />
                    <SidebarItem to="/analytics" icon={Activity} label="Analytiques" />
                    <SidebarItem to="/alerts" icon={Bell} label="Alertes" />
                    <SidebarItem to="/devices" icon={Cpu} label="Appareils ESP32" />

                    <div className="mt-6 mb-2 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Modules Avancés</div>
                    <SidebarItem to="/crop-analysis" icon={Sparkles} label="Diagnostic IA" />
                    <SidebarItem to="/drone-missions" icon={Disc} label="Survol Drone" />
                    <SidebarItem to="/maintenance" icon={Wrench} label="Maintenance Tech" />
                    <SidebarItem to="/notifications" icon={Bell} label="Notifications" />

                    {user.role === 'ADMIN' && (
                        <>
                            <div className="mt-6 mb-2 px-4 text-[11px] font-bold text-red-400 uppercase tracking-wider">Administration</div>
                            <SidebarItem to="/audit-logs" icon={ShieldCheck} label="Journaux Audit" />
                        </>
                    )}

                    <div className="mt-6 mb-2 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Compte</div>
                    <SidebarItem to="/subscription" icon={CreditCard} label="Abonnement" />
                    <SidebarItem to="/settings" icon={Settings} label="Paramètres" />
                </nav>

                {/* Action & User Profile inside Sidebar */}
                <div className="p-4 relative border-t border-white/5 space-y-3">
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="w-full bg-gradient-to-r from-neon-blue to-neon-cyan text-navy-900 font-bold py-2.5 rounded-xl shadow-lg shadow-neon-blue/20 hover:shadow-neon-blue/40 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Plus size={16} />
                        <span className="text-sm">Nouvelle Tâche</span>
                    </button>

                    {/* User Profile Mini + Logout Button */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-800/50 border border-white/5">
                        <div className="flex items-center gap-2.5 truncate">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom || 'User')}&background=0284c7&color=fff`} className="w-8 h-8 rounded-full border border-neon-blue/30 shrink-0" alt="Profile" />
                            <div className="truncate">
                                <div className="text-xs font-semibold text-white truncate">{user.nom || 'Agriculteur'}</div>
                                <div className="text-[10px] text-neon-cyan font-mono uppercase">{user.role || 'AGRICULTEUR'}</div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Déconnexion"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Header */}
                <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-navy-950/50 backdrop-blur-sm z-30 relative">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>

                        {/* Search Bar */}
                        <div className="hidden md:flex relative w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-blue transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher une parcelle, un boîtier..."
                                className="w-full bg-navy-900 border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <div className="relative" ref={notificationButtonRef}>
                            <button
                                className={`btn-icon relative p-2 rounded-xl bg-navy-900 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white ${showNotifications ? 'bg-white/10 text-white' : ''}`}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={18} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-neon-alert rounded-full animate-pulse"></span>
                            </button>

                            {showNotifications && (
                                <div className="notification-panel">
                                    <NotificationPanel onClose={() => setShowNotifications(false)} />
                                </div>
                            )}
                        </div>

                        <NavLink to="/settings" className="p-2 rounded-xl bg-navy-900 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white">
                            <Settings size={18} />
                        </NavLink>

                        {/* Header Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all"
                            title="Déconnexion"
                        >
                            <LogOut size={15} />
                            <span className="hidden sm:inline">Déconnexion</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth" onClick={() => setShowNotifications(false)}>
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>

                {/* Task Creation Modal */}
                <CreateTaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSubmit={(data) => {
                        setIsTaskModalOpen(false);
                    }}
                />
            </div>
        </div>
    );
};

export default Layout;

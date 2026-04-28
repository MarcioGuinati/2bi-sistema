import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  LogOut,
  TrendingUp,
  Layers,
  CreditCard,
  Users,
  PieChart,
  Settings,
  Target,
  FileText,
  Sun,
  Moon,
  ShieldCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Trophy,
  Briefcase,
  Zap,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, isCollapsed, toggleCollapse, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const clientLinks = [
    { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Estratégia', path: '/dashboard?tab=dashboard', icon: PieChart },
    { name: 'Planejamento', path: '/my-planning', icon: Target },
    { name: 'Lançamentos', path: '/finance', icon: Wallet },
    { name: 'Categorias', path: '/categories', icon: Layers },
    { name: 'Contas & Cartões', path: '/accounts', icon: CreditCard },
    { name: 'Orçamentos', path: '/budgets', icon: Star },
    ...(user?.hasReportAccess ? [{ name: 'Relatórios PDF', path: '/reports', icon: FileText }] : []),
    ...(user?.hasAIAccess ? [{ name: 'IA Insights', path: '/insights', icon: Zap }] : []),
    { name: 'Mentoria 2BI', path: '/mentoria', icon: Calendar },
  ];

  const partnerLinks = [
    { name: 'Carteira', path: '/admin', icon: Users },
    { name: 'Mentoria & CRM', path: '/admin/mentorship', icon: Calendar },
    { name: 'Financeiro', path: '/admin/finances', icon: TrendingUp },
    { name: 'Minha Mentoria', path: '/mentoria', icon: Star },
  ];

  const adminLinks = [
    { name: 'Gestão Clientes', path: '/admin', icon: Users },
    { name: 'Parceiros', path: '/admin/partners', icon: Briefcase },
    { name: 'Relatórios Master', path: '/admin/reports', icon: FileText },
    { name: 'Configuração IA', path: '/admin/ai', icon: Cpu },
    { name: 'Finanças', path: '/admin/finances', icon: TrendingUp },
    { name: 'Mentoria Master', path: '/admin/mentorship', icon: Calendar },
    { name: 'Segurança', path: '/admin/security', icon: ShieldCheck },
    { name: 'Logs de Auditoria', path: '/admin/audit-logs', icon: Shield },
  ];

  const links = user?.role === 'admin' ? adminLinks : (user?.role === 'partner' ? partnerLinks : clientLinks);

  return (
    <div className={`
      fixed inset-y-0 left-0 lg:left-6 lg:top-6 lg:bottom-6 z-[130] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
      ${isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
      ${isCollapsed ? 'lg:w-[110px]' : 'lg:w-[280px]'}
    `}>
      <div className="flex flex-col h-full bg-navy-900 lg:rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(1,22,56,0.5)] relative overflow-hidden">

        {/* Header & Logo Section */}
        <div className="p-8 flex flex-col items-center gap-6 relative z-10 w-full mb-2">
          <Link to="/panel" className="group">
            <div className="flex items-center justify-center transition-all duration-500 group-hover:scale-110">
              <img src="/logo_2bi.png" alt="2BI" className="w-full max-w-[160px] object-contain brightness-0 invert opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            </div>
          </Link>

          {/* User Profile Section (Restored) */}
          {!isCollapsed && (
            <Link
              to="/profile"
              className="w-full bg-white/5 border border-white/5 p-4 rounded-[2rem] flex items-center gap-4 hover:bg-white/10 transition-all group"
            >
              <div className="relative">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-12 h-12 rounded-2xl object-cover border border-gold/20" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold font-black border border-gold/20">
                    {user?.name?.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-navy-900 shadow-lg"></div>
              </div>
              <div className="overflow-hidden">
                <div className="text-white text-xs font-black truncate tracking-tight">{user?.name?.split(' ')[0]}</div>
                <div className="text-[9px] text-gold font-black uppercase tracking-[0.2em] opacity-70">Acesso Premium</div>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 space-y-3 overflow-y-auto custom-scrollbar relative z-10">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end
              onClick={onClose}
              className={() => {
                const [pathname, search] = link.path.split('?');
                const isPathMatch = location.pathname === pathname;
                const currentSearch = location.search;
                const targetSearch = search ? `?${search}` : '';
                const isActive = isPathMatch && (currentSearch === targetSearch || (!search && !currentSearch));

                return `
                flex items-center rounded-3xl transition-all duration-500 group relative
                gap-5 px-6 py-4.5
                ${isCollapsed ? 'lg:justify-center lg:px-0 lg:w-16 lg:mx-auto' : ''}
                ${isActive
                    ? 'bg-white/10 text-gold font-black italic uppercase text-[10px] tracking-widest'
                    : 'text-white/40 hover:text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest'}
              `;
              }}
            >
              {() => {
                const [pathname, search] = link.path.split('?');
                const isPathMatch = location.pathname === pathname;
                const currentSearch = location.search;
                const targetSearch = search ? `?${search}` : '';
                const isActive = isPathMatch && (currentSearch === targetSearch || (!search && !currentSearch));

                return (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 w-1.5 h-6 bg-gold rounded-full"
                      />
                    )}
                    <link.icon
                      size={20}
                      className={`${isCollapsed ? '' : 'shrink-0'} group-hover:scale-110 transition-transform duration-500`}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                    <span className={`truncate ${isCollapsed ? 'hidden' : 'block'}`}>{link.name}</span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Utility Card (Adapted for Dark/Light) */}
        <div className="p-6 mt-auto relative z-10 w-full mb-2">
          <div className={`
              bg-white dark:bg-navy-800/80 dark:backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl transition-all duration-500 border border-slate-100 dark:border-white/5
              ${isCollapsed ? 'items-center px-4' : ''}
           `}>
            {!isCollapsed && (
              <div className="mb-4">
                <div className="text-navy-900 dark:text-white font-black italic uppercase tracking-tighter text-sm">Workspace</div>
                <div className="text-slate-400 dark:text-navy-400 text-[9px] font-black uppercase tracking-widest opacity-80">Ambiente Protegido</div>
              </div>
            )}

            <div className={`flex gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
              <button
                onClick={toggleTheme}
                className="flex-1 h-12 bg-slate-50 dark:bg-navy-900/50 hover:bg-slate-100 dark:hover:bg-navy-900 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-300 hover:text-gold transition-all border border-transparent dark:border-white/5"
                title="Alterar Tema"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button
                onClick={logout}
                className="flex-1 h-12 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 transition-all hover:scale-105 active:scale-95 shadow-sm border border-transparent dark:border-red-500/20"
                title="Sair"
              >
                <LogOut size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Close Button / Expand for desktop */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-12 bg-gold text-navy-900 rounded-l-2xl items-center justify-center shadow-2xl hover:bg-white hidden lg:flex transition-all z-20 group"
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={4} /> : <ChevronLeft size={14} strokeWidth={4} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

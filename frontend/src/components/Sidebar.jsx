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
  Sun,
  Moon,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Trophy,
  Briefcase,
  Zap
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
    { name: 'Dashboard Estratégico', path: '/dashboard?tab=dashboard', icon: PieChart },
    { name: 'Extrato Financeiro', path: '/finance', icon: Wallet },
    { name: 'Contas Bancárias', path: '/accounts', icon: CreditCard },
    { name: 'Categorias', path: '/categories', icon: Layers },
    { name: 'Metas e Orçamentos', path: '/budgets', icon: Target },
    { name: 'Insights de IA', path: '/insights', icon: Zap },
    { name: 'Agendar Metoria', path: '/mentoria', icon: Calendar },
  ];

  const partnerLinks = [
    { name: 'Minha Carteira', path: '/admin', icon: Users },
    { name: 'Monitoramento Financeiro', path: '/admin/mentorship', icon: PieChart },
    { name: 'Controle de Lançamentos', path: '/admin/finances', icon: TrendingUp },
    { name: 'Agenda Meet', path: '/mentoria', icon: Calendar },
  ];

  const adminLinks = [
    { name: 'Base de Usuários', path: '/admin', icon: Users },
    { name: 'Gestão de Parceiros', path: '/admin/partners', icon: Briefcase },
    { name: 'Visão Geral Mentoria', path: '/admin/mentorship', icon: PieChart },
    { name: 'Configuração IA', path: '/admin/ai', icon: Cpu },
    { name: 'Controle Financeiro', path: '/admin/finances', icon: TrendingUp },
    { name: 'Segurança & 2FA', path: '/admin/security', icon: ShieldCheck },
    { name: 'Agenda Meet', path: '/mentoria', icon: Calendar },
  ];

  const links = user?.role === 'admin' ? adminLinks : (user?.role === 'partner' ? partnerLinks : clientLinks);

  return (
    <div className={`
      fixed inset-y-0 left-0 bg-navy-900 flex flex-col border-r border-white/5 z-[100] shadow-2xl transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
      ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
    `}>
      <div className={`p-8 pb-10 flex items-center justify-between ${isCollapsed ? 'px-8 lg:px-4' : 'px-8'}`}>
        <Link to="/panel" className={`block transform hover:scale-[1.02] transition-all duration-300 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
          <img 
            src="/logo_2bi.png" 
            alt="2BI Planejamento" 
            className="w-full max-w-[180px] h-auto object-contain drop-shadow-xl"
          />
        </Link>
        {isCollapsed && (
             <div className="hidden lg:flex w-10 h-10 bg-gold rounded-xl items-center justify-center text-navy-900 font-black text-xl mx-auto shadow-lg shadow-gold/20">2B</div>
        )}
        
        {/* Toggle Button for Desktop */}
        <button 
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-4 top-10 w-8 h-8 bg-gold rounded-full items-center justify-center text-navy-900 shadow-xl hover:scale-110 transition-all border-4 border-navy-900"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {links.map((link) => (
          link.external ? (
            <a 
              key={link.name}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-6 py-4 rounded-2xl text-white/50 hover:text-gold hover:bg-white/5 transition-all group font-bold font-medium"
            >
              <link.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">{link.name}</span>
            </a>
          ) : (
            <NavLink
              key={link.name}
              to={link.path}
              end
              onClick={onClose}
              title={isCollapsed ? link.name : ''}
              className={() => {
                const [pathname, search] = link.path.split('?');
                const isPathMatch = location.pathname === pathname;
                const currentSearch = location.search.replace('?', '');
                const targetSearch = search || '';
                const isActive = isPathMatch && (currentSearch === targetSearch || (currentSearch === '' && targetSearch === ''));

                return `
                  flex items-center rounded-2xl transition-all group font-bold font-medium mb-1
                  gap-4 px-6 py-4
                  ${isCollapsed ? 'lg:justify-center lg:p-4 lg:gap-0' : ''}
                  ${isActive ? 'bg-gold text-navy-900 shadow-xl shadow-gold/20' : 'text-white/40 hover:text-white hover:bg-white/5'}
                `;
              }}
            >
              <link.icon size={20} className="group-hover:scale-110 transition-transform shrink-0" />
              <span className={`text-sm truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>{link.name}</span>
            </NavLink>
          )
        ))}
      </nav>

      {/* User & Logout */}
      <div className={`border-t border-white/5 bg-navy-950/40 transition-all p-6 ${isCollapsed ? 'lg:p-2' : ''}`}>
        <div className={`flex items-center gap-4 mb-6 px-2 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-black shrink-0">
            {user?.name.charAt(0)}
          </div>
          <div className={`overflow-hidden ${isCollapsed ? 'lg:hidden' : 'block'}`}>
            <div className="text-white text-xs font-black truncate">{user?.name}</div>
            <div className="text-[10px] text-gold font-black uppercase tracking-widest">{user?.role}</div>
          </div>
        </div>
        
        <div className={`flex gap-2 mb-4 ${isCollapsed ? 'lg:hidden' : 'flex'}`}>
            <button 
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-gold hover:border-gold/50 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
            >
                {theme === 'light' ? (
                    <><Moon size={14} className="text-gold" /> Escuro</>
                ) : (
                    <><Sun size={14} className="text-gold" /> Claro</>
                )}
            </button>
        </div>

        <button 
          onClick={logout}
          title={isCollapsed ? 'Sair' : ''}
          className={`flex items-center rounded-2xl text-red-400 hover:bg-red-400/10 transition-all font-black text-xs uppercase tracking-widest gap-4 px-6 py-4 w-full ${isCollapsed ? 'lg:justify-center lg:p-4' : ''}`}
        >
          <LogOut size={18} className="shrink-0" /> 
          <span className={`${isCollapsed ? 'lg:hidden' : 'block'}`}>Sair da Conta</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

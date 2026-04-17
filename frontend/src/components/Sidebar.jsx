import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const clientLinks = [
    { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Extrato Financeiro', path: '/finance', icon: Wallet },
    { name: 'Contas Bancárias', path: '/accounts', icon: CreditCard },
    { name: 'Categorias', path: '/categories', icon: Layers },
    { name: 'Metas e Orçamentos', path: '/budgets', icon: Target },
    { name: 'Agendar Mentoria', path: '/mentoria', icon: Calendar },
  ];

  const adminLinks = [
    { name: 'Base de Clientes', path: '/admin', icon: Users },
    { name: 'Controle Financeiro', path: '/admin/finances', icon: TrendingUp },
    { name: 'Agenda Meet', path: '/mentoria', icon: Calendar },
  ];

  const links = user?.role === 'admin' ? adminLinks : clientLinks;

  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 w-72 bg-navy-900 flex flex-col border-r border-white/5 z-50 shadow-2xl transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Brand */}
      <div className="p-8 pb-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center font-black text-navy-900 text-xl shadow-lg shadow-gold/20">
            2BI
          </div>
          <div className="flex flex-col">
            <div className="text-white font-black tracking-tighter text-lg leading-none">PLANEJAMENTO</div>
            <div className="text-gold text-[8px] font-black uppercase tracking-[0.2em] mt-1">Estratégia Financeira</div>
          </div>
        </div>
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
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group font-bold font-medium
                ${isActive ? 'bg-gold text-navy-900 shadow-xl shadow-gold/10' : 'text-white/40 hover:text-white hover:bg-white/5'}
              `}
            >
              <link.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">{link.name}</span>
            </NavLink>
          )
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-6 border-t border-white/5 bg-navy-950/40">
        <div className="flex items-center gap-4 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-black">
            {user?.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-xs font-black truncate">{user?.name}</div>
            <div className="text-[10px] text-gold font-black uppercase tracking-widest">{user?.role}</div>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
            <button 
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-gold hover:border-gold/50 transition-all font-bold text-[10px] uppercase tracking-widest"
            >
                {theme === 'light' ? (
                    <><Moon size={14} /> Modo Escuro</>
                ) : (
                    <><Sun size={14} /> Modo Claro</>
                )}
            </button>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all font-black text-xs uppercase tracking-widest"
        >
          <LogOut size={18} /> Sair da Conta
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

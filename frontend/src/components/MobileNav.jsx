import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  PieChart,
  Menu,
  Users,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MobileNav = ({ onOpenMenu }) => {
  const { user } = useAuth();
  const location = useLocation();

  const clientBottomLinks = [
    { name: 'Início', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Finanças', path: '/finance', icon: Wallet },
    { name: 'Dashboard', path: '/dashboard?tab=dashboard', icon: PieChart },
    { name: 'Contas', path: '/accounts', icon: CreditCard },
  ];

  const adminBottomLinks = [
    { name: 'Gestão', path: '/admin', icon: Users },
    { name: 'Financeiro', path: '/admin/finances', icon: TrendingUp },
    { name: 'Mentoria', path: '/admin/mentorship', icon: Calendar },
  ];

  const links = (user?.role === 'admin' || user?.role === 'partner') ? adminBottomLinks : clientBottomLinks;

  const checkActive = (path) => {
    const [pathname, search] = path.split('?');
    const isPathMatch = location.pathname === pathname;
    const currentSearch = location.search;
    const targetSearch = search ? `?${search}` : '';
    return isPathMatch && (currentSearch === targetSearch || (!search && !currentSearch));
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[110] px-4 pb-6 pt-2 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pointer-events-none">
      <div className="bg-navy-900 shadow-[0_-20px_50px_rgba(1,22,56,0.3)] rounded-[2.5rem] p-2 flex items-center justify-between border border-white/10 pointer-events-auto">
        {links.map((link) => {
          const isActive = checkActive(link.path);
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center flex-1 py-3 transition-all duration-500 rounded-3xl ${isActive ? 'text-gold' : 'text-white/40'}`}
            >
              <link.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} className={isActive ? 'animate-bounce' : ''} />
              <span className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isActive ? 'opacity-100' : 'opacity-40'}`}>{link.name}</span>
            </NavLink>
          );
        })}

        {/* Mobile Menu Trigger */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center flex-1 py-3 text-white/40 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center mb-1 group">
            <Menu size={20} className="text-gold group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNav;

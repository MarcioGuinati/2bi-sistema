import React from 'react';
import { Search, Bell, Menu, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const TopBar = ({ toggleMobileSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-transparent relative z-50">
      {/* Mobile Menu Button (Optional if using MobileNav) */}
      <button 
        onClick={toggleMobileSidebar}
        className="lg:hidden p-3 bg-white dark:bg-navy-800 rounded-2xl shadow-xl mr-4 active:scale-90 transition-all border border-slate-100 dark:border-navy-700"
      >
        <Menu size={20} className="text-navy-900 dark:text-white" />
      </button>

      {/* Global Search - Ultra Minimalist */}
      <div className="relative flex-1 max-w-md hidden md:block group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Busca estratégica..."
          className="w-full pl-16 pr-6 py-4 bg-white dark:bg-navy-800 border-none rounded-[2rem] shadow-premium-sm focus:ring-4 focus:ring-gold/10 transition-all outline-none text-sm font-bold dark:text-white"
        />
      </div>

      {/* Modern Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2 md:gap-3 bg-white dark:bg-navy-800 p-1.5 rounded-[2rem] shadow-lg border border-slate-100 dark:border-navy-700">
          <button 
            onClick={toggleTheme}
            title={theme === 'light' ? 'Night Side' : 'Light Side'}
            className="p-3 bg-slate-50 dark:bg-navy-900/50 rounded-2xl hover:text-gold transition-all text-slate-600 dark:text-slate-300 active:scale-90 border border-transparent dark:border-white/5"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        {/* User Portal Access */}
        <Link 
            to="/profile" 
            className="flex items-center gap-4 pl-4 md:pl-6 border-l-2 border-slate-200 dark:border-navy-700 hover:opacity-80 transition-all group"
        >
          <div className="text-right hidden sm:block">
            <div className="text-sm font-black text-navy-900 dark:text-white leading-tight font-heading tracking-tighter uppercase italic">{user?.name?.split(' ')[0]}</div>
            <div className="text-[9px] font-black text-gold uppercase tracking-[0.2em] opacity-70">Acesso Premium</div>
          </div>
          <div className="relative">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-gold to-gold-600 p-0.5 shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                <div className="w-full h-full bg-white dark:bg-navy-900 rounded-[0.9rem] flex items-center justify-center overflow-hidden">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-lg font-black text-gold">{user?.name?.charAt(0)}</span>
                    )}
                </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-navy-900 shadow-lg shadow-green-500/20"></div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default TopBar;

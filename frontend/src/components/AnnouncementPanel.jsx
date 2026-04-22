import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Megaphone, 
  Trophy, 
  Activity, 
  X, 
  ExternalLink,
  ChevronRight,
  Star
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const AnnouncementPanel = () => {
  const { theme } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements?activeOnly=true');
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Erro ao buscar avisos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const getTypeStyles = (type) => {
    switch (type) {
      case 'update':
        return {
          bg: 'bg-blue-600',
          lightBg: 'bg-blue-500/10',
          text: 'text-blue-600',
          icon: Activity,
          label: 'Atualização do Sistema'
        };
      case 'promo':
        return {
          bg: 'bg-amber-500',
          lightBg: 'bg-amber-500/10',
          text: 'text-amber-600',
          icon: Megaphone,
          label: 'Oferta Exclusiva'
        };
      case 'contest':
        return {
          bg: 'bg-purple-600',
          lightBg: 'bg-purple-500/10',
          text: 'text-purple-600',
          icon: Trophy,
          label: 'Sorteio Especial'
        };
      default:
        return {
          bg: 'bg-navy-900',
          lightBg: 'bg-slate-500/10',
          text: 'text-slate-600',
          icon: Bell,
          label: 'Comunicado'
        };
    }
  };

  const styles = getTypeStyles(current.type);

  return (
    <div className="mb-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative group"
        >
          {/* Main Card Container */}
          <div className={`
            relative overflow-hidden rounded-[2rem] transition-all duration-500
            ${theme === 'dark' 
              ? `p-1 bg-gradient-to-r ${current.type === 'promo' ? 'from-amber-400 via-gold to-amber-500 shadow-xl shadow-amber-900/20' : current.type === 'update' ? 'from-blue-400 via-blue-600 to-indigo-600 shadow-xl shadow-blue-900/20' : 'from-navy-900 to-navy-800 shadow-xl shadow-black/40'}` 
              : `bg-white border border-slate-100 shadow-2xl shadow-slate-200/60`
            }
          `}>
            {/* Light Mode Left Accent */}
            {theme !== 'dark' && (
              <div className={`absolute top-0 left-0 bottom-0 w-2 z-20 ${styles.bg}`} />
            )}

            <div className={`
              relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 p-5 md:p-8 overflow-hidden
              ${theme === 'dark' ? 'bg-[var(--bg-secondary)] rounded-[1.4rem]' : 'bg-white'}
            `}>
              
              {/* Decorative Background Elements */}
              <div className={`absolute top-0 right-0 w-64 h-64 ${styles.lightBg} rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity whitespace-pre`}></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
                <div className={`
                  w-14 h-14 md:w-20 md:h-20 ${styles.bg} text-white rounded-[1.2rem] md:rounded-[2rem] flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-500 flex-shrink-0
                  ${theme !== 'dark' ? 'shadow-xl' : ''}
                `}>
                  <styles.icon className="w-7 h-7 md:w-9 md:h-9" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] ${styles.text}`}>
                      {styles.label}
                    </span>
                    {current.priority && (
                      <span className="bg-gold/10 text-gold text-[7px] md:text-[8px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-gold/20 flex items-center gap-1">
                        <Star size={8} fill="currentColor" /> DESTAQUE
                      </span>
                    )}
                  </div>
                  <h3 className={`text-lg md:text-2xl font-black tracking-tight line-clamp-2 md:line-clamp-1 italic leading-tight ${theme === 'dark' ? 'text-white' : 'text-navy-900'}`}>
                    {current.title}
                  </h3>
                  <p className={`text-xs md:text-sm font-medium line-clamp-3 md:line-clamp-2 mt-1 md:pr-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {current.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 relative z-10 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-slate-100 dark:border-white/5 md:border-none">
                {announcements.length > 1 && (
                  <div className="flex gap-1.5 md:mr-6">
                    {announcements.map((_, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1 rounded-full cursor-pointer transition-all ${idx === currentIndex ? 'bg-gold w-4 md:w-6' : 'bg-slate-200 dark:bg-white/10 w-1.5 md:w-2'}`} 
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-none justify-end">
                  {current.link && (
                    <a 
                      href={current.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`
                        flex-1 md:flex-none btn-primary !py-2.5 md:!py-3.5 !px-4 md:!px-8 flex items-center justify-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest
                        ${theme === 'dark' ? 'shadow-xl' : 'shadow-lg shadow-gold/20'}
                      `}
                    >
                      Ver <span className="hidden sm:inline">Detalhes</span> <ExternalLink size={12} className="md:w-3.5 md:h-3.5" />
                    </a>
                  )}
                  
                  <button 
                    onClick={() => announcements.length > 1 ? setCurrentIndex((currentIndex + 1) % announcements.length) : setAnnouncements([])}
                    className="p-2.5 md:p-3.5 text-slate-400 hover:text-gold transition-all rounded-[0.8rem] md:rounded-[1rem] bg-[var(--bg-primary)] border border-[var(--border-primary)] hover:border-gold hover:bg-gold/5"
                  >
                    {announcements.length > 1 ? <ChevronRight size={18} /> : <X size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementPanel;

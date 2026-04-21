import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Eye, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const ImpersonationBanner = () => {
    const navigate = useNavigate();
    const { isImpersonating, user, stopImpersonating } = useAuth();

    if (!isImpersonating) return null;

    const handleStop = () => {
        stopImpersonating();
        navigate('/admin');
    };

    return (
        <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 sm:bottom-auto sm:top-0 left-0 lg:left-72 right-0 z-[100] px-4 py-3 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center lg:text-left shadow-2xl"
        >
            {/* Glassmorphism Background layer */}
            <div className="absolute inset-0 bg-gold/95 backdrop-blur-md shadow-[0_-4px_30px_rgba(0,0,0,0.1)] sm:shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-t sm:border-t-0 sm:border-b border-navy-900/10" />

            {/* Content */}
            <div className="relative flex items-center gap-3">
                <div className="flex items-center gap-2 text-navy-900">
                    <div className="bg-navy-900 text-gold p-1.5 rounded-lg shadow-inner">
                        <ShieldAlert size={16} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] opacity-80">
                            Modo Consultoria Ativo:
                        </span>
                        <span className="text-xs sm:text-sm font-black text-navy-900 italic">
                            {user?.name || 'Cliente'}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleStop}
                className="relative group bg-navy-900 text-gold pl-4 pr-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/20 active:scale-95"
            >
                <div className="w-6 h-6 bg-gold/10 rounded-lg flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <LogOut size={14} />
                </div>
                Voltar para Admin
            </button>
        </motion.div>
    );
};

export default ImpersonationBanner;

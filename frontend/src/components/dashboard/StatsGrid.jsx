import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <motion.div
        whileHover={{ y: -5 }}
        className="card-premium p-8 flex items-center gap-6"
      >
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shadow-inner">
          <ArrowUpRight size={32} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Entradas do Mês</p>
          <h3 className="text-2xl font-black text-[var(--text-primary)]">R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="card-premium p-8 flex items-center gap-6"
      >
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center shadow-inner">
          <ArrowDownLeft size={32} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Saídas Consolidadas</p>
          <h3 className="text-2xl font-black text-red-600">R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-[var(--bg-secondary)] p-8 rounded-[2rem] shadow-xl shadow-gold/5 border border-gold/10 flex items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 font-medium">
          <TrendingUp size={80} className="text-gold" />
        </div>
        <div className="w-16 h-16 bg-gold/10 text-gold rounded-3xl flex items-center justify-center border border-gold/20">
          <Wallet size={32} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] uppercase font-black text-gold tracking-widest mb-1">Saldo Atual</p>
          <h3 className="text-2xl font-black text-[var(--text-primary)] italic">R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsGrid;

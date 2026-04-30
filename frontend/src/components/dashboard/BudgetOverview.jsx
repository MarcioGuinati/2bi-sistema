import React from 'react';
import { motion } from 'framer-motion';
import { Info, TrendingUp } from 'lucide-react';

const BudgetOverview = ({ goals, onOpenGoalModal }) => {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-[var(--text-primary)] shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold font-heading">Orçamentário</h3>
            <div className="group/tip relative">
              <Info size={12} className="text-navy-900 dark:text-gold cursor-help opacity-50" />
              <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10 text-left">
                Calculado com base nos limites que você definiu para cada categoria. Mostra o consumo do seu orçamento em tempo real.
              </div>
            </div>
          </div>
          <TrendingUp className="text-gold" size={24} />
        </div>
        <div className="space-y-8">
          {goals.length > 0 ? goals.map(goal => {
            const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100);
            const isExceeded = percentage > 100;

            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex justify-between items-end text-xs font-bold">
                  <div className="flex flex-col">
                    <span className="text-gold uppercase tracking-widest">{goal.title}</span>
                    <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-tighter">
                      {goal.Category?.name ? `Cat: ${goal.Category.name}` : 'Meta Geral'}
                    </span>
                  </div>
                  <span className={`${isExceeded ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>{percentage}%</span>
                </div>
                <div className="h-3 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-primary)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    className={`h-full shadow-lg ${isExceeded ? 'bg-red-500 shadow-red-500/20' : 'bg-gradient-to-r from-gold to-yellow-500 shadow-gold/20'}`}
                  />
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-bold flex justify-between">
                  <span>Gasto: R$ {Number(goal.currentAmount).toLocaleString()}</span>
                  <span>Limite: R$ {Number(goal.targetAmount).toLocaleString()}</span>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-10 text-[var(--text-secondary)] italic text-sm">Nenhum orçamento definido.</div>
          )}
        </div>
      </div>
      <button
        onClick={onOpenGoalModal}
        className="w-full mt-8 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-all shadow-sm"
      >
        Configurar Novo Limite
      </button>
    </div>
  );
};

export default BudgetOverview;

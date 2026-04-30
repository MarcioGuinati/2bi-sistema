import React from 'react';
import { TrendingUp, Info, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const PerformanceIndicators = ({ stats, dashboardData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-[2rem] shadow-sm relative group">
        <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
          <TrendingUp size={40} className="absolute -bottom-2 -right-2 text-gold/5 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex justify-between items-start mb-1 relative z-10">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Savings Rate</p>
          <div className="group/tip relative">
            <Info size={10} className="text-gold cursor-help opacity-40 hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
              Cálculo: (Renda - Gastos) / Renda. Reflete a sua eficiência em converter ganhos em patrimônio.
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2 relative z-10">
          <h4 className="text-2xl font-black text-gold">
            {stats.income > 0 ? Math.max(0, Math.round(((stats.income - stats.expense) / stats.income) * 100)) : 0}%
          </h4>
          <span className="text-[10px] font-black text-slate-400 mb-1.5 uppercase">da renda</span>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-[2rem] shadow-sm relative group">
        <div className="flex justify-between items-start mb-1 relative z-10">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Status Receita</p>
          <div className="group/tip relative">
            <Info size={10} className="text-gold cursor-help opacity-40 hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
              Mostra o crescimento ou queda da sua renda total comparada ao mês anterior.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <h4 className={`text-2xl font-black ${dashboardData.comparison?.income?.percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {dashboardData.comparison?.income?.percent ? dashboardData.comparison.income.percent.toFixed(1) : '0.0'}%
          </h4>
          {dashboardData.comparison?.income?.percent >= 0 ? (
            <ArrowUpRight size={18} className="text-green-500" />
          ) : (
            <ArrowDownLeft size={18} className="text-red-500" />
          )}
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 relative z-10">vs mês anterior</p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-[2rem] shadow-sm relative group">
        <div className="flex justify-between items-start mb-1 relative z-10">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Controle de Saídas</p>
          <div className="group/tip relative">
            <Info size={10} className="text-gold cursor-help opacity-40 hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
              Representa a variação dos seus gastos. Porcentagem verde indica economia; vermelha indica aumento.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <h4 className={`text-2xl font-black ${dashboardData.comparison?.expense?.percent <= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(dashboardData.comparison?.expense?.percent || 0).toFixed(1)}%
          </h4>
          {dashboardData.comparison?.expense?.percent <= 0 ? (
            <ArrowDownLeft size={18} className="text-green-500" />
          ) : (
            <ArrowUpRight size={18} className="text-red-500" />
          )}
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 relative z-10">
          {dashboardData.comparison?.expense?.percent <= 0 ? 'Economia' : 'Aumento'} de gastos
        </p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-[2rem] shadow-sm relative group">
        <div className="flex justify-between items-start mb-1 relative z-10">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Liberdade Financeira</p>
          <div className="group/tip relative">
            <Info size={10} className="text-gold cursor-help opacity-40 hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
              Calcula quanto do seu custo de vida atual está sendo coberto pelas sobras financeiras deste mês.
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2 relative z-10">
          <h4 className="text-2xl font-black text-[var(--text-primary)]">
            {Math.min(100, Math.round((stats.balance / (stats.expense || 1)) * 100))}%
          </h4>
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 relative z-10">Cobertura Mensal</p>
      </div>
    </div>
  );
};

export default PerformanceIndicators;

import React from 'react';
import { ChevronRight } from 'lucide-react';

const RecentTransactions = ({ transactions }) => {
  return (
    <div className="card-premium overflow-hidden">
      <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center">
        <h3 className="text-xl font-bold font-heading">Lançamentos Recentes</h3>
        <a href="/finance" className="text-xs font-black text-gold uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
          Acessar Gestão Completa <ChevronRight size={14} />
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--bg-primary)] text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              <th className="px-8 py-5">Descrição</th>
              <th className="px-8 py-5">Categoria</th>
              <th className="px-8 py-5">Data</th>
              <th className="px-8 py-5 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-[var(--bg-primary)]/20 transition-colors group">
                <td className="px-8 py-5">
                  <div className="text-sm font-bold">{t.description}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-widest italic">{t.Account?.name || 'Geral'}</div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)]">
                    {t.Category?.name || 'Sem categoria'}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm text-[var(--text-secondary)] font-medium">
                  {new Date(t.date).toLocaleDateString('pt-BR')}
                </td>
                <td className={`px-8 py-5 text-right font-black text-sm ${t.type === 'income' ? 'text-green-600' : 'text-[var(--text-primary)]'}`}>
                  {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;

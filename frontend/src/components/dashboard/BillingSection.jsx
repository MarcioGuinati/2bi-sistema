import React from 'react';
import { CreditCard } from 'lucide-react';

const BillingSection = ({ contracts, payments, onDownloadContract }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contract Overview */}
        <div className="lg:col-span-1 space-y-6">
          {contracts.length > 0 ? contracts.map(c => (
            <div key={c.id} className="bg-navy-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="relative z-10 space-y-6">
                <div>
                  <span className="text-[8px] font-black text-gold uppercase tracking-[0.3em] px-3 py-1 bg-gold/10 rounded-full border border-gold/20">Seu Plano Ativo</span>
                  <h3 className="text-2xl font-black italic mt-3 tracking-tighter text-white">{c.title}</h3>
                </div>

                <div className="space-y-4">
                  {Number(c.setupValue) > 0 && (
                    <div className="flex justify-between items-end border-b border-white/5 pb-3">
                      <span className="text-[10px] uppercase font-black text-white/40">Valor Projeto</span>
                      <span className="text-lg font-black text-gold">R$ {Number(c.setupValue).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-[10px] uppercase font-black text-white/40">Mensalidade</span>
                    <span className="text-xl font-black text-white italic">R$ {Number(c.monthlyValue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase font-black text-white/40">Vínculo desde</span>
                    <span className="text-xs font-bold text-white/60">{new Date(c.startDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDownloadContract(c)}
                  className="w-full py-4 bg-gold text-navy-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gold/20"
                >
                  <CreditCard size={16} /> Baixar Contrato PDF
                </button>
              </div>
            </div>
          )) : (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-12 rounded-[2.5rem] text-center">
              <CreditCard className="text-slate-200 mx-auto mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum contrato ativo identificado.</p>
            </div>
          )}

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 rounded-[2.5rem] shadow-sm">
            <h4 className="text-xs font-black uppercase text-gold tracking-widest mb-4">Informação de Apoio</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              Suas mensalidades são geradas automaticamente. Caso tenha dúvidas sobre cobranças ou precise alterar dados de faturamento, entre em contato via WhatsApp com nossa equipe.
            </p>
          </div>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium overflow-hidden border border-[var(--border-primary)]">
            <div className="p-6 md:p-8 border-b border-[var(--border-primary)]">
              <h3 className="text-lg md:text-xl font-bold font-heading">Histórico de Parcelas</h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-[var(--bg-primary)] text-[10px] font-black uppercase text-slate-400">
                    <th className="px-8 py-6">Vencimento</th>
                    <th className="px-8 py-6">Descrição</th>
                    <th className="px-8 py-6">Valor</th>
                    <th className="px-8 py-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-primary)]">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                      <td className="px-6 md:px-8 py-4 md:py-6 text-xs font-black">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 md:px-8 py-4 md:py-6">
                        <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight">{p.description}</div>
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-6 text-sm font-black italic whitespace-nowrap">R$ {Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                        <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border shadow-sm ${p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                          {p.status === 'paid' ? 'Liquidado' : 'Aguardando'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSection;

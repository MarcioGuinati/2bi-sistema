import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { maskCurrency } from '../../utils/masks';

const GoalModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  form, 
  setForm, 
  categories 
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]"
        >
          <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
            <div className="bg-navy-900 p-8 text-white flex justify-between items-center shrink-0">
              <div className="text-left">
                <h3 className="text-2xl font-black font-heading tracking-tight !text-white">Definir Orçamento</h3>
                <p className="text-gold text-[10px] font-black uppercase tracking-widest font-medium">Fronteira Financeira 2BI</p>
              </div>
              <button type="button" onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] font-medium">Título do Orçamento</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold text-[var(--text-primary)]"
                  placeholder="Ex: Gasto com Alimentação"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] font-medium">Limite Mensal (R$)</label>
                  <input
                    type="text"
                    required
                    value={form.targetAmount}
                    onChange={e => setForm({ ...form, targetAmount: maskCurrency(e.target.value) })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-black text-[var(--text-primary)]"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] font-medium">Vincular Categoria</label>
                  <select
                    required
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                    className="select-premium font-bold text-[var(--text-primary)]"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                  </select>
                </div>
              </div>
              {!form.category_id && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] font-medium">Valor Já Acumulado</label>
                  <input
                    type="text"
                    value={form.currentAmount}
                    onChange={e => setForm({ ...form, currentAmount: maskCurrency(e.target.value) })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold text-[var(--text-primary)]"
                    placeholder="R$ 0,00"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] font-medium">Prazo Estimado</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="input-premium font-bold text-[var(--text-primary)]"
                />
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] italic">O sistema calculará automaticamente seus gastos nesta categoria do dia 1º até hoje.</p>
            </div>

            <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
              <button type="submit" className="w-full btn-primary py-5 font-black text-lg shadow-gold/30">
                Ativar Orçamento
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoalModal;

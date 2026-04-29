import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Target,
  Search,
  X,
  Edit2,
  Trash2,
  Calendar,
  TrendingUp,
  ChevronRight,
  PieChart,
  Flag
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const BudgetManagement = () => {
  const { success, error, confirm } = useNotification();
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalsRes, catsRes] = await Promise.all([
        api.get('/goals'),
        api.get('/categories')
      ]);
      setGoals(goalsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Error fetching budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}`, form);
      } else {
        await api.post('/goals', form);
      }
      setShowModal(false);
      setEditingGoal(null);
      setForm({ title: '', targetAmount: '', currentAmount: '', deadline: '', category_id: '' });
      success(editingGoal ? 'Estratégia atualizada!' : 'Nova meta definida com sucesso!');
      fetchData();
    } catch (err) { error('Erro ao salvar meta'); }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Excluir Meta/Orçamento',
      message: 'Esta meta será removida permanentemente. Deseja continuar?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/goals/${id}`);
          success('Removido com sucesso');
          fetchData();
        } catch (err) { error('Erro ao excluir'); }
      }
    });
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline || '',
      category_id: goal.category_id || ''
    });
    setShowModal(true);
  };

  return (
    <SystemLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">Metas e Orçamentos</h1>
            <p className="text-[var(--text-secondary)] font-medium tracking-tight">Defina seus limites de gastos e alvos de poupança.</p>
          </div>
          <button
            onClick={() => { setEditingGoal(null); setForm({ title: '', targetAmount: '', currentAmount: '', deadline: '', category_id: '' }); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Nova Meta / Orçamento
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card-premium p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-navy-900 text-gold rounded-2xl flex items-center justify-center">
              <Flag size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400">Ativos</p>
              <p className="text-xl font-black">{goals.length}</p>
            </div>
          </div>
        </div>

        {/* Budgets Table */}
        <div className="card-premium overflow-hidden">
          <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-primary)]/50">
            <h3 className="text-xl font-bold font-heading">Visão Orçamentária Detalhada</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-primary)] text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Identificação</th>
                  <th className="px-8 py-5">Tipo / Categoria</th>
                  <th className="px-8 py-5">Progresso</th>
                  <th className="px-8 py-5">Valor Alvo</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {goals.map((g) => {
                  const percentage = Math.round((g.currentAmount / g.targetAmount) * 100);
                  const isExceeded = percentage > 100;

                  return (
                    <tr key={g.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-sm tracking-tight">{g.title}</div>
                        {g.deadline && <div className="text-[10px] text-slate-400 font-medium">Prazo: {new Date(g.deadline).toLocaleDateString('pt-BR')}</div>}
                      </td>
                      <td className="px-8 py-5">
                        {g.category_id ? (
                          <span className="text-[10px] font-black uppercase px-3 py-1 rounded-lg bg-red-50 text-red-600">
                            Orçamento: {g.Category?.name}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase px-3 py-1 rounded-lg bg-green-50 text-green-600">
                            Meta de Poupança
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 min-w-[200px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className={isExceeded ? 'text-red-500' : 'text-slate-400'}>{percentage}% consumido</span>
                            <span className="font-bold">R$ {Number(g.currentAmount).toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-primary)]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(percentage, 100)}%` }}
                              className={`h-full ${isExceeded ? 'bg-red-500' : 'bg-gold'} rounded-full`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-black text-sm">
                        R$ {Number(g.targetAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(g)}
                            className="p-2 text-slate-400 hover:text-gold bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)] transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(g.id)}
                            className="p-2 text-slate-400 hover:text-red-600 bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white flex flex-col max-h-[90vh]">
              <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="bg-navy-900 p-8 text-white flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-2xl font-black font-heading tracking-tight !text-white">{editingGoal ? 'Ajustar Meta' : 'Definir Meta / Orçamento'}</h3>
                    <p className="text-gold text-[10px] font-black uppercase tracking-widest font-medium">Bússola Financeira 2BI</p>
                  </div>
                  <button type="button" onClick={() => setShowModal(false)} className="text-white/50 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 font-medium">Título da Meta</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold"
                      placeholder="Ex: Reserva Emergência ou Orçamento Mercado"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 font-medium">Valor Alvo (Limite)</label>
                      <input
                        type="number"
                        required
                        value={form.targetAmount}
                        onChange={e => setForm({ ...form, targetAmount: e.target.value })}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-black"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 font-medium">Vincular Categoria (Budget)</label>
                      <select
                        value={form.category_id}
                        onChange={e => setForm({ ...form, category_id: e.target.value })}
                        className="select-premium font-bold"
                      >
                        <option value="">Nenhuma (Meta Geral)</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>)}
                      </select>
                    </div>
                  </div>
                  {!form.category_id && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 font-medium">Valor Já Acumulado</label>
                      <input
                        type="number"
                        value={form.currentAmount}
                        onChange={e => setForm({ ...form, currentAmount: e.target.value })}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 font-medium">Prazo Estimado</label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={e => setForm({ ...form, deadline: e.target.value })}
                      className="input-premium font-bold"
                    />
                  </div>
                </div>

                <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
                  <button type="submit" className="w-full btn-primary py-5 font-black text-lg shadow-gold/30">
                    {editingGoal ? 'Salvar Estratégia' : 'Confirmar Estratégia'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SystemLayout>
  );
};

export default BudgetManagement;

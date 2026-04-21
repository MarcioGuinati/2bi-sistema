import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const FinanceManagement = () => {
  const { success, error, confirm } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Initialize dates for current month
  const getInitialDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  };

  const initialDates = getInitialDates();

  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    account_id: '',
    description: '',
    startDate: initialDates.start,
    endDate: initialDates.end
  });

  const [showTransModal, setShowTransModal] = useState(false);
  const [editingTrans, setEditingTrans] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [form, setForm] = useState({
    amount: '',
    description: '',
    type: 'expense',
    category_id: '',
    account_id: '',
    date: new Date().toISOString().split('T')[0],
    recurrenceType: 'none',
    installmentsCount: 1,
    repeatUntil: '',
    is_paid: false
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...filters
      }).toString();

      const statsParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate
      }).toString();

      const [transRes, catsRes, accsRes, statsRes] = await Promise.all([
        api.get(`/transactions?${queryParams}`),
        api.get('/categories'),
        api.get('/accounts'),
        api.get(`/transactions/stats?${statsParams}`)
      ]);

      setTransactions(transRes.data.rows);
      setTotalPages(transRes.data.pages);
      setCategories(catsRes.data);
      setAccounts(accsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filters]);

  const handleTransSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrans) {
        await api.put(`/transactions/${editingTrans.id}`, form);
      } else {
        await api.post('/transactions', form);
      }
      setShowTransModal(false);
      success(editingTrans ? 'Lançamento atualizado!' : 'Lançamento registrado com sucesso!');
      fetchData();
    } catch (err) { error('Erro ao processar transação'); }
  };

  const handleDeleteTrans = (id) => {
    confirm({
      title: 'Excluir Transação',
      message: 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/transactions/${id}`);
          success('Transação excluída com sucesso');
          fetchData();
        } catch (err) { error('Erro ao excluir transação'); }
      }
    });
  };

  const handleBulkDelete = () => {
    confirm({
      title: 'Excluir em Lote',
      message: `Tem certeza que deseja excluir as ${selectedIds.length} transações selecionadas? Esta ação não pode ser desfeita.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.post('/transactions/bulk-delete', { ids: selectedIds });
          success(`${selectedIds.length} transações excluídas com sucesso`);
          setSelectedIds([]);
          fetchData();
        } catch (err) { error('Erro ao excluir transações em lote'); }
      }
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length && transactions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const handleOpenEdit = (t) => {
    setEditingTrans(t);
    setForm({
      amount: t.amount,
      description: t.description,
      type: t.type,
      category_id: t.category_id,
      account_id: t.account_id,
      date: t.date,
      recurrenceType: 'none',
      installmentsCount: 1,
      repeatUntil: '',
      is_paid: t.is_paid
    });
    setShowTransModal(true);
  };

  const clearFilters = () => {
    const dates = getInitialDates();
    setFilters({
      type: '',
      category_id: '',
      account_id: '',
      description: '',
      startDate: dates.start,
      endDate: dates.end
    });
  };

  return (
    <SystemLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Extrato Financeiro</h1>
            <p className="text-[var(--text-secondary)] font-medium tracking-tight">Análise detalhada do seu fluxo de caixa estratégico.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => { 
                setEditingTrans(null); 
                setForm({ 
                  ...form, 
                  amount: '', 
                  description: '', 
                  recurrenceType: 'none',
                  installmentsCount: 1,
                  repeatUntil: '',
                  is_paid: form.type === 'income' // Default true for income
                }); 
                setShowTransModal(true); 
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} /> Novo Lançamento
            </button>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-50 text-red-600 border border-red-100 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all shadow-sm"
              >
                <Trash2 size={18} /> Excluir ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="card-premium p-8 space-y-6">
          <div className="flex items-center gap-2 font-bold text-sm mb-2">
            <Calendar size={18} className="text-gold" /> Filtros de Pesquisa
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Descrição</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filters.description}
                  onChange={e => setFilters({ ...filters, description: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">De (Data Inicial)</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3 rounded-xl text-sm outline-none focus:border-gold font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Até (Data Final)</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] px-4 py-3 rounded-xl text-sm outline-none focus:border-gold font-bold"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Tipo</label>
                <select
                  value={filters.type}
                  onChange={e => setFilters({ ...filters, type: e.target.value })}
                  className="select-premium font-bold"
                >
                  <option value="">Todos</option>
                  <option value="income">Receitas</option>
                  <option value="expense">Despesas</option>
                </select>
              </div>
              <button
                onClick={clearFilters}
                className="p-3 bg-[var(--bg-primary)] text-slate-400 hover:text-[var(--text-primary)] rounded-xl transition-colors self-end"
                title="Resetar Filtros"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Conta Bancária</label>
              <select
                value={filters.account_id}
                onChange={e => setFilters({ ...filters, account_id: e.target.value })}
                className="select-premium font-bold"
              >
                <option value="">Todas as Contas</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Categoria</label>
              <select
                value={filters.category_id}
                onChange={e => setFilters({ ...filters, category_id: e.target.value })}
                className="select-premium font-bold"
              >
                <option value="">Todas as Categorias</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div className="card-premium overflow-hidden">
          <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center">
            <h3 className="text-xl font-bold font-heading">Transações Encontradas</h3>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-slate-100 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-[var(--text-primary)]">Página {page} de {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-[var(--border-primary)] disabled:opacity-30 hover:bg-[var(--bg-primary)]"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-primary)] text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5 w-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-[var(--border-primary)] text-gold focus:ring-gold"
                      checked={selectedIds.length === transactions.length && transactions.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Descrição / Origem</th>
                  <th className="px-8 py-5">Categoria</th>
                  <th className="px-8 py-5">Valor</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {transactions.map((t) => (
                  <tr key={t.id} className={`hover:bg-slate-50/20 group transition-all duration-300 ${!t.is_paid ? 'opacity-60 grayscale-[0.4]' : ''} ${selectedIds.includes(t.id) ? 'bg-gold/5' : ''}`}>
                    <td className="px-8 py-5">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-[var(--border-primary)] text-gold focus:ring-gold"
                        checked={selectedIds.includes(t.id)}
                        onChange={() => toggleSelect(t.id)}
                      />
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-[var(--text-primary)]">{new Date(t.date).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold tracking-tight">{t.description}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase font-black tracking-widest italic">{t.Account?.name || 'Geral'}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)]">
                        {t.Category?.name || 'Sem Categoria'}
                      </span>
                    </td>
                    <td className={`px-8 py-5 font-black text-sm ${t.type === 'income' ? 'text-green-600' : 'text-[var(--text-primary)]'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5 flex justify-end gap-2">
                       <button
                         onClick={async () => {
                           try {
                             await api.put(`/transactions/${t.id}`, { ...t, is_paid: !t.is_paid });
                             success(t.is_paid ? 'Marcado como pendente' : 'Confirmado como pago!');
                             fetchData();
                           } catch (err) { error('Falha ao atualizar status'); }
                         }}
                         title={t.is_paid ? 'Marcar como Pendente' : 'Marcar como Pago'}
                         className={`p-2 rounded-lg border transition-all ${
                           t.is_paid 
                             ? 'bg-green-50 text-green-600 border-green-200' 
                             : 'bg-amber-50 text-amber-600 border-amber-200'
                         }`}
                       >
                         <CreditCard size={16} />
                       </button>
                      <button onClick={() => handleOpenEdit(t)} className="p-2 text-slate-400 hover:text-navy-900 rounded-lg bg-[var(--bg-secondary)] shadow-sm border border-[var(--border-primary)]"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteTrans(t.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg bg-[var(--bg-secondary)] shadow-sm border border-[var(--border-primary)]"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 italic">Nenhuma transação encontrada no período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TRANSACTION MODAL */}
      <AnimatePresence>
        {showTransModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="bg-navy-900 p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black font-heading tracking-tight">{editingTrans ? 'Alterar Lançamento' : 'Novo Registro'}</h3>
                  <p className="text-gold text-xs font-black uppercase tracking-widest font-medium">Controle de Fluxo 2BI</p>
                </div>
                <button onClick={() => setShowTransModal(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleTransSubmit} className="p-8 space-y-4 font-medium">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'income' })}
                    className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${form.type === 'income' ? 'bg-green-50 border-green-600 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    <ArrowUpRight size={20} /> Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'expense' })}
                    className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${form.type === 'expense' ? 'bg-red-50 border-red-600 text-red-600' : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-slate-400'}`}
                  >
                    <ArrowDownLeft size={20} /> Despesa
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">Valor</label>
                    <input type="number" step="0.01" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold text-lg font-black" placeholder="R$ 0,00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">Descrição</label>
                    <input type="text" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold" placeholder="Ex: Investimento Ativo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400">Categoria</label>
                      <select required value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="select-premium font-bold">
                        <option value="">Selecionar</option>
                        {categories.filter(c => c.type === form.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400">Conta Destino</label>
                      <select required value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })} className="select-premium font-bold">
                        <option value="">Selecionar</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">Data da Operação</label>
                    <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-premium font-bold" />
                  </div>

                  <div className="pt-4 border-t border-[var(--border-primary)] flex items-center justify-between">
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Status de Pagamento</label>
                      <p className="text-[10px] text-slate-400 italic">Marque se esta transação já foi liquidada.</p>
                    </div>
                    <button
                       type="button"
                       onClick={() => setForm({ ...form, is_paid: !form.is_paid })}
                       className={`w-14 h-8 rounded-full relative transition-all duration-300 ${form.is_paid ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${form.is_paid ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {!editingTrans && (
                    <div className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                      <label className="text-[10px] uppercase font-black text-slate-400">Tipo de Repetição</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'none', label: 'Único' },
                          { id: 'fixed', label: 'Fixo' },
                          { id: 'installments', label: 'Parcelado' }
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setForm({ ...form, recurrenceType: mode.id })}
                            className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${form.recurrenceType === mode.id ? 'border-gold bg-gold/10 text-gold' : 'border-[var(--border-primary)] text-slate-400'}`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      {form.recurrenceType === 'fixed' && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                          <label className="text-[10px] uppercase font-black text-slate-400">Repetir Até (Opcional)</label>
                          <input 
                            type="date" 
                            value={form.repeatUntil} 
                            onChange={e => setForm({ ...form, repeatUntil: e.target.value })} 
                            className="input-premium font-bold" 
                          />
                        </div>
                      )}

                      {form.recurrenceType === 'installments' && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                          <label className="text-[10px] uppercase font-black text-slate-400">Número de Parcelas</label>
                          <input 
                            type="number" 
                            min="2" 
                            required
                            value={form.installmentsCount} 
                            onChange={e => setForm({ ...form, installmentsCount: e.target.value })} 
                            className="input-premium font-bold" 
                            placeholder="Ex: 12"
                          />
                          <p className="text-[10px] text-gold font-bold italic mt-1">O valor informado será dividido entre as parcelas.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button type="submit" className="w-full btn-primary py-5 font-black text-lg shadow-gold/30 mt-4">Confirmar Lançamento</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SystemLayout>
  );
};

export default FinanceManagement;

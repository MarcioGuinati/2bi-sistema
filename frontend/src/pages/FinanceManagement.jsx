import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import { maskCurrency, sanitizeValue } from '../utils/masks';

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

  // Import State
  const [showImportOptionsModal, setShowImportOptionsModal] = useState(false);
  const [importingAccId, setImportingAccId] = useState('');
  const [showTextModal, setShowTextModal] = useState(false);
  const [rawText, setRawText] = useState('');
  const [textImporting, setTextImporting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTransactions, setPreviewTransactions] = useState([]);
  const [selectedTxIds, setSelectedTxIds] = useState([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const fileInputRef = React.useRef(null);

  const [form, setForm] = useState({
    amount: maskCurrency('0'),
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

  const selectionStats = useMemo(() => {
    const selected = transactions.filter(t => selectedIds.includes(t.id));
    const income = selected.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = selected.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [selectedIds, transactions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...filters
      }).toString();

      const statsParams = new URLSearchParams({
        ...filters
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
      const sanitizedForm = {
        ...form,
        amount: sanitizeValue(form.amount)
      };
      if (editingTrans) {
        await api.put(`/transactions/${editingTrans.id}`, sanitizedForm);
      } else {
        await api.post('/transactions', sanitizedForm);
      }
      setShowTransModal(false);
      success(editingTrans ? 'Lançamento atualizado!' : 'Lançamento registrado com sucesso!');
      fetchData();
    } catch (err) { error('Erro ao processar transação'); }
  };

  const handleBulkUpdate = async () => {
    try {
      await api.post('/transactions/bulk-update', {
        ids: selectedIds,
        date: bulkDate
      });
      setShowBulkEditModal(false);
      setSelectedIds([]);
      success('Transações atualizadas com sucesso!');
      fetchData();
    } catch (err) {
      error('Erro ao realizar edição em massa');
    }
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
      amount: maskCurrency(t.amount),
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

  // Import Functions
  const handleOpenImportOptions = () => {
    setImportingAccId('');
    setShowImportOptionsModal(true);
  };

  const handleStartOFXImport = () => {
    if (!importingAccId) {
      error('Selecione uma conta primeiro');
      return;
    }
    setShowImportOptionsModal(false);
    fileInputRef.current.click();
  };

  const handleStartTextImport = () => {
    if (!importingAccId) {
      error('Selecione uma conta primeiro');
      return;
    }
    setShowImportOptionsModal(false);
    setRawText('');
    setShowTextModal(true);
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('account_id', importingAccId);

    try {
      success('Analisando arquivo OFX...');
      const response = await api.post('/import/ofx-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPreviewTransactions(response.data);
      const nonDuplicates = response.data
        .map((t, idx) => t.isDuplicate ? null : idx)
        .filter(idx => idx !== null);

      setSelectedTxIds(nonDuplicates);
      setShowPreviewModal(true);
    } catch (err) {
      error('Falha ao ler arquivo OFX. Verifique o formato.');
    } finally {
      e.target.value = null;
    }
  };

  const handleProcessTextImport = async () => {
    if (!rawText.trim()) {
      error('Cole o texto do extrato primeiro.');
      return;
    }

    try {
      setTextImporting(true);
      success('Analisando texto com IA...');
      const response = await api.post('/import/text-preview', {
        account_id: importingAccId,
        text: rawText
      });

      setPreviewTransactions(response.data);
      setSelectedTxIds(response.data.map((_, i) => i));
      setShowTextModal(false);
      setShowPreviewModal(true);
    } catch (err) {
      error(err.response?.data?.error || 'Falha ao processar texto.');
    } finally {
      setTextImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (selectedTxIds.length === 0) {
      error('Nenhuma transação selecionada');
      return;
    }

    const selectedTxs = selectedTxIds.map(idx => previewTransactions[idx]);

    try {
      success('Importando transações selecionadas...');
      const response = await api.post('/import/ofx-confirm', {
        account_id: importingAccId,
        transactions: selectedTxs
      });

      success(`${response.data.imported} transações importadas com sucesso!`);
      setShowPreviewModal(false);
      fetchData();
    } catch (err) {
      error('Erro ao confirmar importação.');
    }
  };

  const toggleTxSelection = (index) => {
    if (selectedTxIds.includes(index)) {
      setSelectedTxIds(selectedTxIds.filter(i => i !== index));
    } else {
      setSelectedTxIds([...selectedTxIds, index]);
    }
  };

  const removeTxFromPreview = (index) => {
    const newPreview = [...previewTransactions];
    newPreview.splice(index, 1);
    setPreviewTransactions(newPreview);
    setSelectedTxIds(selectedTxIds
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i)
    );
  };

  const updatePreviewTxCategory = (index, categoryId) => {
    const newPreview = [...previewTransactions];
    newPreview[index] = { ...newPreview[index], category_id: categoryId || null };
    setPreviewTransactions(newPreview);
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
              onClick={handleOpenImportOptions}
              className="btn-secondary flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold px-4 py-2 rounded-xl"
            >
              Importar Lançamentos
            </button>
            <button
              onClick={() => { 
                setEditingTrans(null); 
                setForm({ 
                  ...form, 
                  amount: maskCurrency('0'), 
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

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="card-premium p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-100 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ArrowUpRight size={80} className="text-green-600" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-black text-green-600 tracking-widest mb-1">Total Receitas (Filtrado)</p>
              <h3 className="text-2xl font-black text-green-600">R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 relative z-10">
              <ArrowUpRight size={24} />
            </div>
          </div>

          <div className="card-premium p-6 bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-100 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ArrowDownLeft size={80} className="text-red-600" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-black text-red-600 tracking-widest mb-1">Total Despesas (Filtrado)</p>
              <h3 className="text-2xl font-black text-red-600">R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 relative z-10">
              <ArrowDownLeft size={24} />
            </div>
          </div>

          <div className="card-premium p-6 bg-navy-900 border-navy-800 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={80} className="text-gold" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-black text-gold tracking-widest mb-1">Saldo do Período</p>
              <h3 className="text-2xl font-black text-white">R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="w-12 h-12 bg-gold text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20 relative z-10">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-gold/10 border border-gold/20 p-6 rounded-[2.5rem] flex flex-col xl:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-6 w-full xl:w-auto">
                  <div className="w-14 h-14 bg-gold text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-gold/20 shrink-0">
                    {selectedIds.length}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-gold tracking-widest">Transações Selecionadas</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">Gerencie os itens marcados.</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
                  <div className="text-center xl:text-right w-full sm:w-auto">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Líquido Selecionado</p>
                    <p className={`text-2xl font-black transition-colors ${selectionStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {selectionStats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto sm:border-l border-gold/20 sm:pl-6">
                    <button 
                      onClick={() => setShowBulkEditModal(true)}
                      className="flex-1 sm:flex-none p-4 bg-gold text-white rounded-2xl hover:bg-gold/80 transition-all shadow-md flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                      <Edit2 size={16} /> <span className="hidden sm:inline">Vencimento</span><span className="sm:hidden">Editar Vencimento</span>
                    </button>
                    <button 
                      onClick={handleBulkDelete}
                      className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all shadow-md flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                      <Trash2 size={16} /> <span className="hidden sm:inline">Excluir</span><span className="sm:hidden">Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        {format(parseISO(t.date), 'dd/MM/yyyy')}
                      </div>
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
                      <button onClick={() => handleOpenEdit(t)} className="p-2 text-slate-400 hover:text-gold rounded-lg bg-[var(--bg-secondary)] shadow-sm border border-[var(--border-primary)] transition-all" title="Editar"><Edit2 size={16} /></button>
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
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <form onSubmit={handleTransSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="bg-navy-900 p-8 text-white flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-2xl font-black font-heading tracking-tight">{editingTrans ? 'Alterar Lançamento' : 'Novo Registro'}</h3>
                    <p className="text-gold text-xs font-black uppercase tracking-widest font-medium">Controle de Fluxo 2BI</p>
                  </div>
                  <button type="button" onClick={() => setShowTransModal(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
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
                      <input type="text" required value={form.amount} onChange={e => setForm({ ...form, amount: maskCurrency(e.target.value) })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold text-lg font-black" placeholder="R$ 0,00" />
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
                </div>

                <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
                  <button type="submit" className="w-full btn-primary py-5 font-black text-lg shadow-gold/30">Confirmar Lançamento</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMPORT OPTIONS MODAL */}
      <AnimatePresence>
        {showImportOptionsModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[var(--border-primary)] flex flex-col max-h-[90vh]">
              <div className="bg-navy-900 p-6 text-white flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black font-heading tracking-tight !text-white">Importar Lançamentos</h3>
                <button onClick={() => setShowImportOptionsModal(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Conta Destino</label>
                  <select
                    value={importingAccId}
                    onChange={e => setImportingAccId(e.target.value)}
                    className="select-premium font-bold w-full"
                  >
                    <option value="">Selecione a conta para importação...</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleStartOFXImport}
                    className="p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-gold hover:text-gold transition-all text-[var(--text-secondary)] font-bold shadow-sm"
                  >
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Arquivo</span>
                    <span className="text-sm">OFX</span>
                  </button>
                  <button
                    onClick={handleStartTextImport}
                    className="p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-gold hover:text-gold transition-all text-[var(--text-secondary)] font-bold shadow-sm"
                  >
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Inteligência</span>
                    <span className="text-sm">Texto / IA</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEXT IMPORT MODAL */}
      <AnimatePresence>
        {showTextModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center sm:p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-[var(--border-primary)] flex flex-col max-h-[90vh]">
              <div className="bg-navy-900 p-6 text-white flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black font-heading tracking-tight !text-white">Importar por Texto (IA)</h3>
                <button onClick={() => setShowTextModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
              </div>
              <div className="p-6 md:p-8 space-y-4 overflow-y-auto custom-scrollbar">
                <p className="text-sm text-slate-500 font-medium">
                  Cole o texto do seu extrato bancário abaixo. A Inteligência Artificial irá identificar as transações, formatar datas e valores, e sugerir as melhores categorias automaticamente.
                </p>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold min-h-[200px] text-sm resize-y font-mono"
                  placeholder="Ex:&#10;05/10/2023 COMPRA SUPERMERCADO - 150,50&#10;06/10/2023 TRANSFERENCIA PIX - 50,00"
                />
                <div className="pt-4 flex gap-4">
                  <button onClick={() => setShowTextModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all text-xs">Cancelar</button>
                  <button onClick={handleProcessTextImport} disabled={textImporting} className="flex-1 py-4 bg-navy-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gold disabled:opacity-50 transition-all text-xs">
                    {textImporting ? 'Analisando...' : 'Analisar com IA'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK EDIT MODAL */}
      <AnimatePresence>
        {showBulkEditModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[var(--border-primary)]">
              <div className="bg-gold p-6 text-navy-900 flex justify-between items-center">
                <h3 className="text-xl font-black font-heading tracking-tight">Edição em Massa</h3>
                <button onClick={() => setShowBulkEditModal(false)} className="p-2 hover:bg-black/5 rounded-full transition-all"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-gold/5 p-4 rounded-2xl border border-gold/20 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gold text-white rounded-xl flex items-center justify-center font-black">
                    {selectedIds.length}
                  </div>
                  <p className="text-xs font-bold text-navy-900/60 uppercase tracking-widest">Itens selecionados para alteração</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-4 tracking-widest">Novo Vencimento</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] pl-14 pr-6 py-4 rounded-2xl outline-none focus:border-gold font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowBulkEditModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all text-xs">Cancelar</button>
                  <button onClick={handleBulkUpdate} className="flex-1 py-4 bg-gold text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gold/80 transition-all text-xs shadow-lg shadow-gold/20">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFX PREVIEW MODAL */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-white flex flex-col max-h-[90vh]">
              <div className="bg-navy-900 p-6 md:p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-heading tracking-tight !text-white">Revisar Importação</h3>
                  <p className="text-white/50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Selecione os lançamentos para inclusão</p>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all shrink-0"><X size={20} /></button>
              </div>
              <div className="p-6 md:p-8 flex-1 overflow-hidden flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex gap-4">
                    <button onClick={() => setSelectedTxIds(previewTransactions.map((_, i) => i))} className="text-[10px] font-black uppercase text-gold hover:underline">Selecionar Todos</button>
                    <button onClick={() => setSelectedTxIds([])} className="text-[10px] font-black uppercase text-slate-400 hover:underline">Desmarcar Todos</button>
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-400">{selectedTxIds.length} de {previewTransactions.length} selecionados</div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {previewTransactions.map((t, idx) => (
                    <div key={idx} className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-4 rounded-2xl border transition-all ${selectedTxIds.includes(idx) ? 'border-gold bg-gold/5 shadow-sm' : 'border-[var(--border-primary)] bg-[var(--bg-primary)] opacity-60'}`}>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <input type="checkbox" checked={selectedTxIds.includes(idx)} onChange={() => toggleTxSelection(idx)} className="w-5 h-5 rounded-lg border-2 border-slate-300 checked:bg-gold checked:border-gold transition-all shrink-0" />
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-navy-900 font-black text-xs shrink-0">{new Date(t.date).getUTCDate()}</div>
                        <div className="flex-1 min-w-0 sm:hidden">
                          <div className={`font-black text-sm text-right ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>{t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="font-bold text-sm text-[var(--text-primary)] truncate">{t.description}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{t.date.split('-').reverse().join('/')}</span>
                          <select
                            value={t.category_id || ''}
                            onChange={(e) => updatePreviewTxCategory(idx, e.target.value)}
                            className="text-[10px] p-1 px-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold outline-none"
                            title="Categoria"
                          >
                            <option value="">Sem Categoria</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="hidden sm:block text-right shrink-0">
                        <div className={`font-black text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>{t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div className="flex justify-end w-full sm:w-auto border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0 pt-2 sm:pt-0">
                        <button onClick={() => removeTxFromPreview(idx)} className="p-1 px-3 sm:p-2 text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 sm:block" title="Remover da lista">
                          <span className="sm:hidden text-[10px] font-black uppercase">Excluir da Prévia</span><X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-col md:flex-row gap-3 md:gap-4">
                  <button onClick={() => setShowPreviewModal(false)} className="order-2 md:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all text-xs">Cancelar</button>
                  <button onClick={handleConfirmImport} disabled={selectedTxIds.length === 0} className="order-1 md:order-2 flex-[2] py-4 bg-navy-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gold disabled:opacity-50 transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-2 text-xs">Confirmar Importação ({selectedTxIds.length})</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".ofx"
        style={{ display: 'none' }}
      />
    </SystemLayout>
  );
};

export default FinanceManagement;

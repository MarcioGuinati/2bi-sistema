import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  CreditCard,
  Wallet,
  Building2,
  DollarSign,
  Upload,
  FileDigit,
  ChevronRight,
  ChevronLeft,
  Eye,
  Check,
  AlertTriangle,
  Minus
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { maskCurrency, sanitizeValue } from '../utils/masks';
import CreditCardComponent from '../components/CreditCard';

const AccountManagement = () => {
  const { success, error, confirm } = useNotification();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAcc, setEditingAcc] = useState(null);
  const [importingAccId, setImportingAccId] = useState(null);
  const fileInputRef = React.useRef(null);
  const [form, setForm] = useState({
    name: '',
    type: 'Corrente',
    initial_balance: maskCurrency('0'),
    credit_limit: maskCurrency('0'),
    invoice_closing_day: '',
    due_day: '',
    color: '#1e293b'
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedAccInvoice, setSelectedAccInvoice] = useState(null);
  const [invoiceTransactions, setInvoiceTransactions] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);
  const [invoiceMonthOffset, setInvoiceMonthOffset] = useState(0);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTransactions, setPreviewTransactions] = useState([]);
  const [selectedTxIds, setSelectedTxIds] = useState([]);

  const [showTextModal, setShowTextModal] = useState(false);
  const [rawText, setRawText] = useState('');
  const [textImporting, setTextImporting] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, catRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/categories')
      ]);
      setAccounts(accRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching data');
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
      const payload = {
        ...form,
        initial_balance: sanitizeValue(form.initial_balance),
        credit_limit: sanitizeValue(form.credit_limit),
        invoice_closing_day: form.type === 'Cartão de Crédito' ? form.invoice_closing_day : null,
        due_day: form.type === 'Cartão de Crédito' ? form.due_day : null
      };

      if (editingAcc) {
        await api.put(`/accounts/${editingAcc.id}`, payload);
      } else {
        await api.post('/accounts', payload);
      }
      setShowModal(false);
      setEditingAcc(null);
      setForm({
        name: '',
        type: 'Corrente',
        initial_balance: maskCurrency('0'),
        credit_limit: maskCurrency('0'),
        invoice_closing_day: '',
        due_day: '',
        color: '#1e293b'
      });
      success(editingAcc ? 'Conta atualizada!' : 'Nova conta bancária registrada!');
      fetchData();
    } catch (err) { error('Erro ao salvar conta'); }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Excluir Conta Bancária',
      message: 'Atenção: A exclusão de uma conta pode afetar o histórico de transações vinculadas a ela. Continuar?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/accounts/${id}`);
          success('Conta excluída');
          fetchData();
        } catch (err) { error('Erro ao excluir conta'); }
      }
    });
  };

  const handleOpenEdit = (acc) => {
    setEditingAcc(acc);
    setForm({
      name: acc.name,
      type: acc.type,
      initial_balance: maskCurrency(acc.initial_balance),
      credit_limit: maskCurrency(acc.credit_limit || '0'),
      invoice_closing_day: acc.invoice_closing_day || '',
      due_day: acc.due_day || '',
      color: acc.color || '#1e293b'
    });
    setShowModal(true);
  };

  const handleImportOFX = (accId) => {
    setImportingAccId(accId);
    fileInputRef.current.click();
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
      // Pre-select all that are NOT duplicates
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

  const handleOpenTextImport = (accId) => {
    setImportingAccId(accId);
    setRawText('');
    setShowTextModal(true);
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
    // Adjust selected indices
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

  const handleOpenInvoice = async (acc, page = 1, offset = 0) => {
    setSelectedAccInvoice(acc);
    setShowInvoiceModal(true);
    setInvoiceLoading(true);
    setInvoicePage(page);
    setInvoiceMonthOffset(offset);

    try {
      const now = new Date();
      // Lógica de datas mais robusta
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + offset);
      const closingDay = parseInt(acc.invoice_closing_day) || 30;

      const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, closingDay + 1);
      const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), closingDay);

      // Ajuste para evitar bugs de virada de mês/ano
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Data inválida");
      }

      const response = await api.get('/transactions', {
        params: {
          account_id: acc.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          limit: 20,
          page
        }
      });

      setInvoiceTransactions(response.data.rows);
      setInvoiceTotalPages(response.data.pages);
    } catch (err) {
      error('Erro ao carregar fatura');
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <SystemLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">Contas e Cartões</h1>
            <p className="text-[var(--text-secondary)] font-medium tracking-tight">Gerencie seus ativos e disponibilidades financeiras.</p>
          </div>
          <button
            onClick={() => {
              setEditingAcc(null);
              setForm({
                name: '',
                type: 'Corrente',
                initial_balance: maskCurrency('0'),
                credit_limit: maskCurrency('0'),
                invoice_closing_day: ''
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Nova Conta
          </button>
        </div>

        {/* Dashboard of Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-navy-900 p-6 rounded-3xl shadow-lg border border-white/5 text-white">
            <div className="text-[10px] uppercase font-black text-gold mb-1">Total em Contas</div>
            <div className="text-2xl font-black italic">R$ {accounts.filter(a => a.type !== 'Cartão de Crédito').reduce((acc, a) => acc + Number(a.current_balance || 0), 0).toLocaleString('pt-BR')}</div>
          </div>
          <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl shadow-sm border border-[var(--border-primary)] text-[var(--text-primary)]">
            <div className="text-[10px] uppercase font-black text-slate-400 mb-1">Limite Disponível</div>
            <div className="text-2xl font-black italic">R$ {accounts.filter(a => a.type === 'Cartão de Crédito').reduce((acc, a) => acc + (Number(a.credit_limit) - Number(a.used_limit || 0)), 0).toLocaleString('pt-BR')}</div>
          </div>
        </div>

        {/* Credit Cards Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black font-heading uppercase tracking-widest text-[var(--text-primary)]">Meus Cartões</h2>
            <div className="h-[1px] flex-1 bg-[var(--border-primary)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {accounts.filter(a => a.type === 'Cartão de Crédito').length > 0 ? (
              accounts.filter(a => a.type === 'Cartão de Crédito').map(acc => (
                <CreditCardComponent
                  key={acc.id}
                  account={acc}
                  onClick={() => handleOpenInvoice(acc)}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onImport={handleImportOFX}
                  onImportText={handleOpenTextImport}
                />
              ))
            ) : (
              <div className="card-premium p-8 text-center text-slate-400 italic md:col-span-3">
                Nenhum cartão de crédito registrado.
              </div>
            )}
          </div>
        </div>

        {/* Accounts Table */}
        <div className="card-premium overflow-hidden">
          <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-primary)]/50">
            <h3 className="text-xl font-bold font-heading">Contas Correntes e Outros</h3>
          </div>
          <div className="table-responsive">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-primary)] text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Identificação</th>
                  <th className="px-8 py-5">Tipo</th>
                  <th className="px-8 py-5">Saldo Atual</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {accounts.filter(a => a.type !== 'Cartão de Crédito').map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--bg-primary)] text-navy-900 rounded-xl flex items-center justify-center">
                          <Building2 size={20} />
                        </div>
                        <div className="font-bold text-sm tracking-tight">{acc.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase text-slate-400 italic block">
                        {acc.type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`font-black text-sm ${Number(acc.current_balance) < 0 ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
                        R$ {Number(acc.current_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex flex-col md:flex-row justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="p-2 text-slate-400 hover:text-gold bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)] transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="p-2 text-slate-400 hover:text-red-600 bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)]"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => handleImportOFX(acc.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)] flex items-center gap-2"
                          title="Importar OFX"
                        >
                          <FileDigit size={16} />
                          <span className="hidden lg:inline text-[9px] font-black uppercase tracking-widest">OFX</span>
                        </button>
                        <button
                          onClick={() => handleOpenTextImport(acc.id)}
                          className="p-2 text-slate-400 hover:text-purple-600 bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)] flex items-center gap-2"
                          title="Importar por Texto"
                        >
                          <Upload size={16} />
                          <span className="hidden lg:inline text-[9px] font-black uppercase tracking-widest">TXT</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-[var(--bg-secondary)] sm:rounded-[2rem] w-full max-w-md h-full sm:h-auto sm:max-h-[90vh] shadow-2xl border border-[var(--border-primary)] flex flex-col overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="bg-navy-900 p-8 text-white flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-2xl font-black font-heading tracking-tight !text-white">{editingAcc ? 'Editar Conta' : 'Nova Conta'}</h3>
                    <p className="text-gold text-[10px] font-black uppercase tracking-widest mt-1 font-medium">Patrimônio 2BI</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">Nome da Conta / Banco</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold"
                      placeholder="Ex: Banco Inter"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400">Tipo</label>
                      <select
                        value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}
                        className="select-premium font-bold"
                      >
                        <option value="Corrente">Corrente</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Poupança">Poupança</option>
                        <option value="Carteira">Carteira</option>
                        <option value="Investimento">Investimento</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400">Saldo Inicial</label>
                      <input
                        type="text"
                        required
                        value={form.initial_balance}
                        onChange={e => setForm({ ...form, initial_balance: maskCurrency(e.target.value) })}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold"
                      />
                    </div>
                  </div>
                  
                  {form.type === 'Cartão de Crédito' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-slate-400">Limite de Crédito</label>
                        <input
                          type="text"
                          required
                          value={form.credit_limit}
                          onChange={e => setForm({ ...form, credit_limit: maskCurrency(e.target.value) })}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-400">Dia Fechamento</label>
                          <input
                            type="number" min="1" max="31" required
                            value={form.invoice_closing_day}
                            onChange={e => setForm({ ...form, invoice_closing_day: e.target.value })}
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-400">Dia Vencimento</label>
                          <input
                            type="number" min="1" max="31" required
                            value={form.due_day}
                            onChange={e => setForm({ ...form, due_day: e.target.value })}
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-400">Cor do Cartão</label>
                        <div className="flex flex-wrap gap-3">
                          {['#1e293b', '#FF6600', '#8A05BE', '#F7D116', '#004B8D', '#003399', '#ED1C24'].map(c => {
                            const labels = {
                              '#FF6600': 'Inter',
                              '#8A05BE': 'Nubank',
                              '#F7D116': 'BB',
                              '#004B8D': 'Bradesco',
                              '#003399': 'Caixa',
                              '#ED1C24': 'Santander',
                              '#1e293b': 'Padrão'
                            };
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setForm({ ...form, color: c })}
                                className={`w-10 h-10 rounded-full border-4 transition-all relative group ${form.color === c ? 'border-gold scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                                style={{ backgroundColor: c }}
                              >
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase hidden group-hover:block whitespace-nowrap bg-navy-900 text-white px-1 rounded">{labels[c]}</span>
                              </button>
                            );
                          })}
                          <input
                            type="color"
                            value={form.color}
                            onChange={e => setForm({ ...form, color: e.target.value })}
                            className="w-10 h-10 rounded-full bg-transparent border-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="p-8 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] shrink-0 space-y-3">
                  <button type="submit" className="w-full btn-primary py-5 font-black text-lg shadow-gold/30">
                    {editingAcc ? 'Salvar Alterações' : 'Criar Conta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:hidden py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Cancelar e Voltar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invoice Details Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedAccInvoice && (
          <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--bg-secondary)] sm:rounded-[2rem] w-full max-w-xl h-full sm:h-auto sm:max-h-[85vh] overflow-hidden shadow-2xl border border-[var(--border-primary)] flex flex-col"
            >
              <div className="bg-navy-900 p-6 text-white relative shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-gold mb-2">
                      <CreditCard size={20} />
                      <span className="text-[10px] uppercase font-black tracking-widest text-gold">
                        {invoiceMonthOffset === 0 ? 'Fatura em Aberto' : invoiceMonthOffset < 0 ? 'Fatura Retroativa' : 'Fatura Futura'}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black font-heading tracking-tight !text-white">{selectedAccInvoice.name}</h3>
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-1">
                      Referente a: {new Date(new Date().getFullYear(), new Date().getMonth() + invoiceMonthOffset).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => setShowInvoiceModal(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                      <X size={20} />
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenInvoice(selectedAccInvoice, 1, invoiceMonthOffset - 1)}
                        className="bg-white/5 p-2 rounded-lg hover:bg-gold transition-colors text-white"
                        title="Mês Anterior"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenInvoice(selectedAccInvoice, 1, invoiceMonthOffset + 1)}
                        className="bg-white/5 p-2 rounded-lg hover:bg-gold transition-colors text-white"
                        title="Próximo Mês"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[9px] uppercase font-black text-gold mb-0.5">Total da Fatura</div>
                      <div className="text-2xl font-black italic">
                        R$ {invoiceTransactions.reduce((acc, t) => acc + Number(t.amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[9px] uppercase font-black text-white/40">Limite Disp.</div>
                       <div className="text-sm font-bold">R$ {(selectedAccInvoice.credit_limit - (selectedAccInvoice.used_limit || 0)).toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--bg-primary)]/30 custom-scrollbar">
                <div className="flex items-center gap-4 mb-4">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">Lançamentos do Ciclo</h4>
                  <div className="h-[1px] flex-1 bg-[var(--border-primary)]" />
                </div>
                <div className="space-y-2">
                  {invoiceLoading ? (
                    <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aguarde...</div>
                  ) : invoiceTransactions.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic text-sm">Sem lançamentos.</div>
                  ) : invoiceTransactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] hover:border-gold/30 transition-all shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-navy-900 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                          {new Date(t.date).getUTCDate()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-[var(--text-primary)] truncate">{t.description}</div>
                          <div className="text-[9px] text-slate-400 font-bold">
                            {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="font-black text-sm text-red-600">R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Fixo */}
              <div className="p-4 sm:p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] shrink-0">
                {invoiceTotalPages > 1 && (
                  <div className="flex items-center justify-between mb-4 bg-[var(--bg-primary)] p-2 rounded-xl border border-[var(--border-primary)]">
                    <button
                      disabled={invoicePage === 1}
                      onClick={() => handleOpenInvoice(selectedAccInvoice, invoicePage - 1, invoiceMonthOffset)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-20"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="text-[9px] uppercase font-black text-slate-400">
                      Página {invoicePage} de {invoiceTotalPages}
                    </div>
                    <button
                      disabled={invoicePage === invoiceTotalPages}
                      onClick={() => handleOpenInvoice(selectedAccInvoice, invoicePage + 1, invoiceMonthOffset)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-20"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
 
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-full bg-navy-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gold transition-all shadow-xl"
                >
                  Fechar Extrato
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFX Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-white flex flex-col max-h-[90vh]">
              <div className="bg-navy-900 p-6 md:p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl md:text-2xl font-black font-heading tracking-tight !text-white">Revisar Importação</h3>
                  <p className="text-white/50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Selecione os lançamentos para inclusão</p>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 flex-1 overflow-hidden flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedTxIds(previewTransactions.map((_, i) => i))}
                      className="text-[10px] font-black uppercase text-gold hover:underline"
                    >
                      Selecionar Todos
                    </button>
                    <button
                      onClick={() => setSelectedTxIds([])}
                      className="text-[10px] font-black uppercase text-slate-400 hover:underline"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-400">
                    {selectedTxIds.length} de {previewTransactions.length} selecionados
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {previewTransactions.map((t, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-4 rounded-2xl border transition-all ${selectedTxIds.includes(idx)
                          ? 'border-gold bg-gold/5 shadow-sm'
                          : 'border-[var(--border-primary)] bg-[var(--bg-primary)] opacity-60'
                        }`}
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <input
                          type="checkbox"
                          checked={selectedTxIds.includes(idx)}
                          onChange={() => toggleTxSelection(idx)}
                          className="w-5 h-5 rounded-lg border-2 border-slate-300 checked:bg-gold checked:border-gold transition-all shrink-0"
                        />

                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-navy-900 font-black text-xs shrink-0">
                          {new Date(t.date).getUTCDate()}
                        </div>

                        <div className="flex-1 min-w-0 sm:hidden">
                          <div className={`font-black text-sm text-right ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                            {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 w-full">
                        <div className="font-bold text-sm text-[var(--text-primary)] truncate">{t.description}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{t.date.split('-').reverse().join('/')}</span>
                          {t.isDuplicate && (
                            <span className="flex items-center gap-1 text-[8px] md:text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <AlertTriangle size={10} /> POSSÍVEL DUPLICATA
                            </span>
                          )}
                          <select
                            value={t.category_id || ''}
                            onChange={(e) => updatePreviewTxCategory(idx, e.target.value)}
                            className="text-[10px] p-1 px-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold outline-none ml-2"
                            title="Categoria"
                          >
                            <option value="">Sem Categoria</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="hidden sm:block text-right shrink-0">
                        <div className={`font-black text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="flex justify-end w-full sm:w-auto border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => removeTxFromPreview(idx)}
                          className="p-1 px-3 sm:p-2 text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 sm:block"
                          title="Remover da lista"
                        >
                          <span className="sm:hidden text-[10px] font-black uppercase">Excluir da Prévia</span>
                          <Minus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="order-2 md:order-1 flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={selectedTxIds.length === 0}
                    className="order-1 md:order-2 flex-[2] py-4 bg-navy-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gold disabled:opacity-50 transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-2 text-xs"
                  >
                    <Check size={20} /> Confirmar Importação ({selectedTxIds.length})
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Text Import Modal */}
      <AnimatePresence>
        {showTextModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-[var(--border-primary)] flex flex-col max-h-[90vh]"
            >
              <div className="bg-navy-900 p-6 text-white flex justify-between items-center shrink-0">
                <h3 className="text-xl font-black font-heading tracking-tight !text-white">Importar por Texto (IA)</h3>
                <button
                  onClick={() => setShowTextModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
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
                  <button
                    onClick={() => setShowTextModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleProcessTextImport}
                    disabled={textImporting}
                    className="flex-1 py-4 bg-navy-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gold disabled:opacity-50 transition-all text-xs"
                  >
                    {textImporting ? 'Analisando...' : 'Analisar com IA'}
                  </button>
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

export default AccountManagement;

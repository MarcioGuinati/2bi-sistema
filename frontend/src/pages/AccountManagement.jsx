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
    invoice_closing_day: ''
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedAccInvoice, setSelectedAccInvoice] = useState(null);
  const [invoiceTransactions, setInvoiceTransactions] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTransactions, setPreviewTransactions] = useState([]);
  const [selectedTxIds, setSelectedTxIds] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (err) {
      console.error('Error fetching accounts');
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
        invoice_closing_day: form.type === 'Cartão de Crédito' ? form.invoice_closing_day : null
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
        invoice_closing_day: ''
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
      invoice_closing_day: acc.invoice_closing_day || ''
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

  const handleOpenInvoice = async (acc, page = 1) => {
    setSelectedAccInvoice(acc);
    setShowInvoiceModal(true);
    setInvoiceLoading(true);
    setInvoicePage(page);
    
    try {
      const now = new Date();
      const dayNow = now.getDate();
      const closingDay = parseInt(acc.invoice_closing_day) || 30;
      
      let startDate, endDate;
      if (dayNow <= closingDay) {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, closingDay + 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), closingDay);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), closingDay + 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, closingDay);
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
            <h1 className="text-3xl font-bold font-heading">Contas Bancárias</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-navy-900 p-6 rounded-3xl shadow-lg border border-white/5 text-white">
            <div className="text-[10px] uppercase font-black text-gold mb-1">Total de Contas</div>
            <div className="text-3xl font-black">{accounts.length}</div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="card-premium overflow-hidden">
          <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-primary)]/50">
            <h3 className="text-xl font-bold font-heading">Meus Bancos e Carteiras</h3>
          </div>
          <div className="table-responsive">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-primary)] text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Identificação</th>
                  <th className="px-8 py-5">Tipo / Ciclo</th>
                  <th className="px-8 py-5">Disponibilidade / Limite</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--bg-primary)] text-gold rounded-xl flex items-center justify-center">
                          <Building2 size={20} />
                        </div>
                        <div className="font-bold text-sm tracking-tight">{acc.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase text-slate-400 italic block">
                        {acc.type}
                      </span>
                      {acc.type === 'Cartão de Crédito' && acc.invoice_closing_day && (
                        <span className="text-[9px] font-bold text-gold uppercase tracking-tighter">
                          Fecha dia {acc.invoice_closing_day}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-sm">
                        {acc.type === 'Cartão de Crédito' 
                          ? `R$ ${Number(acc.used_limit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} utilizados`
                          : `R$ ${Number(acc.initial_balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </div>
                      {acc.type === 'Cartão de Crédito' && acc.credit_limit > 0 && (
                        <div className="mt-2 w-full max-w-[150px]">
                          <div className="flex justify-between text-[10px] mb-1 font-bold">
                            <span className="text-slate-400 capitalize">Limite</span>
                            <span className="text-gold">
                              {Math.min(100, Math.round(((acc.used_limit || 0) / acc.credit_limit) * 100))}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${ ((acc.used_limit || 0) / acc.credit_limit) > 0.8 ? 'bg-red-500' : 'bg-gold' }`}
                              style={{ width: `${Math.min(100, ((acc.used_limit || 0) / acc.credit_limit) * 100)}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-slate-400 mt-1">
                            Disponível: R$ {(acc.credit_limit - (acc.used_limit || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}
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
                        {acc.type === 'Cartão de Crédito' && (
                          <button
                            onClick={() => handleOpenInvoice(acc)}
                            className="p-2 text-slate-400 hover:text-blue-600 bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)] flex items-center gap-2"
                            title="Ver Fatura"
                          >
                            <Eye size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Fatura</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleImportOFX(acc.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)] flex items-center gap-2"
                          title="Importar OFX"
                        >
                          <FileDigit size={16} />
                          <span className="hidden lg:inline text-[9px] font-black uppercase tracking-widest">OFX</span>
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
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white">
              <div className="bg-navy-900 p-8 text-white flex justify-between items-center text-center">
                <h3 className="text-xl font-black font-heading tracking-tight">{editingAcc ? 'Editar Conta' : 'Nova Conta Bancária'}</h3>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
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
                    className="grid grid-cols-2 gap-4 pt-2"
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
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400">Dia de Fechamento</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        required
                        value={form.invoice_closing_day}
                        onChange={e => setForm({ ...form, invoice_closing_day: e.target.value })}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold"
                        placeholder="Ex: 20"
                      />
                    </div>
                  </motion.div>
                )}
                <button type="submit" className="w-full btn-primary py-4 font-black mt-4">Salvar Alterações</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Invoice Details Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedAccInvoice && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white">
              <div className="bg-navy-900 p-8 text-white relative">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-gold mb-2">
                       <CreditCard size={20} />
                       <span className="text-[10px] uppercase font-black tracking-widest">Fatura em Aberto</span>
                    </div>
                    <h3 className="text-3xl font-black font-heading tracking-tight !text-white">{selectedAccInvoice.name}</h3>
                    <p className="text-white/50 text-xs font-bold mt-1">
                      Ciclo: Fechamento dia {selectedAccInvoice.invoice_closing_day}
                    </p>
                  </div>
                  <button onClick={() => setShowInvoiceModal(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all">
                    <X size={20} />
                  </button>
                </div>
 
                <div className="mt-8 bg-white/5 rounded-3xl p-6 border border-white/10">
                  <div className="text-[10px] uppercase font-black text-gold mb-1">Total da Fatura Atual</div>
                  <div className="text-4xl font-black">
                    R$ {invoiceTransactions.reduce((acc, t) => acc + Number(t.amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
 
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Lançamentos do Ciclo</h4>
                  <div className="h-[1px] flex-1 bg-slate-100 mx-4" />
                </div>
 
                <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {invoiceLoading ? (
                    <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando lançamentos...</div>
                  ) : invoiceTransactions.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic">Nenhum lançamento encontrado para este ciclo de fatura.</div>
                  ) : invoiceTransactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] hover:border-gold/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-navy-900 font-black text-xs">
                          {new Date(t.date).getUTCDate()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--text-primary)]">{t.description}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                            {new Date(t.date).toLocaleDateString('pt-BR', { month: 'long' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-red-600">- R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">{t.Category?.name || 'Geral'}</div>
                      </div>
                    </div>
                  ))}
                </div>
 
                {invoiceTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button 
                      disabled={invoicePage === 1}
                      onClick={() => handleOpenInvoice(selectedAccInvoice, invoicePage - 1)}
                      className="p-2 hover:bg-white rounded-xl transition-all disabled:opacity-30 text-navy-900"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                      Página {invoicePage} de {invoiceTotalPages}
                    </div>
                    <button 
                      disabled={invoicePage === invoiceTotalPages}
                      onClick={() => handleOpenInvoice(selectedAccInvoice, invoicePage + 1)}
                      className="p-2 hover:bg-white rounded-xl transition-all disabled:opacity-30 text-navy-900"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
 
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Limite Disponível</div>
                  <div className="text-sm font-black text-[var(--text-primary)] italic">
                    R$ {(selectedAccInvoice.credit_limit - (selectedAccInvoice.used_limit || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
 
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-full mt-6 bg-navy-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gold transition-all shadow-lg shadow-navy-900/10"
                >
                  Fechar Detalhes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFX Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
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
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 p-4 rounded-2xl border transition-all ${
                        selectedTxIds.includes(idx) 
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

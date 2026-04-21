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
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const AccountManagement = () => {
  const { success, error, confirm } = useNotification();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAcc, setEditingAcc] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Corrente', initial_balance: 0 });

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
      if (editingAcc) {
        await api.put(`/accounts/${editingAcc.id}`, form);
      } else {
        await api.post('/accounts', form);
      }
      setShowModal(false);
      setEditingAcc(null);
      setForm({ name: '', type: 'Corrente', initial_balance: 0 });
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
    setForm({ name: acc.name, type: acc.type, initial_balance: acc.initial_balance });
    setShowModal(true);
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
            onClick={() => { setEditingAcc(null); setForm({ name: '', type: 'Corrente', initial_balance: 0 }); setShowModal(true); }}
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
                  <th className="px-8 py-5">Tipo</th>
                  <th className="px-8 py-5">Saldo Inicial</th>
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
                      <span className="text-[10px] font-black uppercase text-slate-400 italic">
                        {acc.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold">
                      R$ {Number(acc.initial_balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col md:flex-row justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="p-2 text-slate-400 hover:text-navy-900 bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)]"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="p-2 text-slate-400 hover:text-red-600 bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)]"
                        >
                          <Trash2 size={16} />
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
                      <option value="Poupança">Poupança</option>
                      <option value="Carteira">Carteira</option>
                      <option value="Investimento">Investimento</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">Saldo Inicial</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.initial_balance}
                      onChange={e => setForm({ ...form, initial_balance: e.target.value })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-4 font-black mt-4">Salvar Alterações</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SystemLayout>
  );
};

export default AccountManagement;

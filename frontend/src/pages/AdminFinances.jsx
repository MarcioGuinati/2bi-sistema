import React, { useState, useEffect } from 'react';
import SystemLayout from '../components/SystemLayout';
import {
    TrendingUp,
    CreditCard,
    ArrowUpCircle,
    ArrowDownCircle,
    Users,
    Search,
    Filter,
    CheckCircle,
    Clock,
    ExternalLink,
    Edit2,
    Trash2,
    X
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminFinances = () => {
    const { success, error, confirm } = useNotification();
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ totalActiveValue: 0, pendingAmount: 0, paidMonth: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dates, setDates] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [editForm, setEditForm] = useState({ amount: '', dueDate: '', description: '', status: '' });

    useEffect(() => {
        fetchData();
    }, [statusFilter, dates]);

    const fetchData = async () => {
        try {
            const queryParams = new URLSearchParams({
                status: statusFilter === 'all' ? '' : statusFilter,
                startDate: dates.start,
                endDate: dates.end
            }).toString();

            const [paymentsRes, statsRes] = await Promise.all([
                api.get(`/admin/billing/payments?${queryParams}`),
                api.get(`/billing/stats?${queryParams}`)
            ]);
            setPayments(paymentsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            error('Erro ao carregar dados financeiros');
        } finally {
            setLoading(false);
        }
    };

    const handlePayDebt = async (id) => {
        try {
            await api.put(`/payments/${id}/pay`);
            success('Pagamento registrado!');
            fetchData();
        } catch (err) {
            error('Erro ao registrar pagamento');
        }
    };

    const handleDeletePayment = (id) => {
        confirm({
            title: 'Excluir Fatura',
            message: 'Tem certeza que deseja excluir este registro financeiro? Esta ação é irreversível.',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/billing/payments/${id}`);
                    success('Registro excluído com sucesso');
                    fetchData();
                } catch (err) {
                    error('Erro ao excluir registro');
                }
            }
        });
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/billing/payments/${editingPayment.id}`, editForm);
            setShowEditModal(false);
            success('Fatura atualizada com sucesso');
            fetchData();
        } catch (err) {
            error('Erro ao atualizar fatura');
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.User?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <SystemLayout>
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        </SystemLayout>
    );

    return (
        <SystemLayout>
            <div className="space-y-10 p-2">
                {/* HEADER */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold font-heading tracking-tight">Controle Financeiro</h1>
                        <p className="text-[var(--text-secondary)] font-medium tracking-tight mt-1">Visão Geral de Receitas da plataforma 2BI.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Status da Operação</span>
                        <div className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-200">Ativa</div>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 flex flex-col justify-between group hover:border-gold/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-navy-900 rounded-2xl flex items-center justify-center text-gold shadow-lg group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Receita Ativa</span>
                                <div className="text-green-500 text-[10px] font-bold flex items-center gap-1 mt-1 justify-end">
                                    <ArrowUpCircle size={10} /> +12%
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-3xl font-bold tracking-tighter">R$ {Number(stats.totalActiveValue).toLocaleString('pt-BR')}</h4>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Contratos ativos</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-navy-900 p-6 rounded-[2.5rem] shadow-xl border border-white/5 flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-navy-900 shadow-lg group-hover:rotate-12 transition-transform">
                                <CreditCard size={24} />
                            </div>
                            <div className="text-right relative z-10">
                                <span className="text-[10px] font-bold uppercase text-white/30">Recebido (Mês)</span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-3xl font-bold text-gold tracking-tighter">R$ {Number(stats.paidMonth).toLocaleString('pt-BR')}</h4>
                            <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest mt-1">Liquidação no período</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6 flex flex-col justify-between group transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-red-100 group-hover:scale-95 transition-transform">
                                <Clock size={24} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold uppercase text-slate-400">A Receber</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-3xl font-bold tracking-tighter">R$ {Number(stats.pendingAmount).toLocaleString('pt-BR')}</h4>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">{payments.filter(p => p.status === 'pending').length} faturas abertas</p>
                        </div>
                    </motion.div>
                </div>

                {/* DATA TABLE */}
                <div className="card-premium overflow-hidden">
                    {/* Table Header / Filters */}
                    <div className="p-8 border-b border-[var(--border-primary)] space-y-6 bg-[var(--bg-primary)]/20">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                            <div className="relative w-full lg:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="text"
                                    placeholder="Pesquisar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-sm font-semibold outline-none focus:border-gold transition-all"
                                />
                            </div>
                            <div className="flex bg-[var(--bg-primary)] p-1 rounded-xl">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-slate-400'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setStatusFilter('pending')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === 'pending' ? 'bg-[var(--bg-secondary)] text-red-500 shadow-sm' : 'text-slate-400'}`}
                                >
                                    Pendentes
                                </button>
                                <button
                                    onClick={() => setStatusFilter('paid')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === 'paid' ? 'bg-[var(--bg-secondary)] text-green-500 shadow-sm' : 'text-slate-400'}`}
                                >
                                    Liquidados
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">De (Data Inicial)</label>
                                <input
                                    type="date"
                                    value={dates.start}
                                    onChange={e => setDates({ ...dates, start: e.target.value })}
                                    className="input-premium font-bold shadow-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Até (Data Final)</label>
                                <input
                                    type="date"
                                    value={dates.end}
                                    onChange={e => setDates({ ...dates, end: e.target.value })}
                                    className="input-premium font-bold shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[var(--bg-primary)] text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Cliente / Usuário</th>
                                    <th className="px-8 py-5">Descrição</th>
                                    <th className="px-8 py-5">Vencimento</th>
                                    <th className="px-8 py-5">Valor</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)]">
                                <AnimatePresence>
                                    {filteredPayments.map((p, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={p.id}
                                            className="hover:bg-slate-50/20 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[var(--bg-primary)] rounded-xl flex items-center justify-center text-[var(--text-primary)] font-bold text-xs shadow-sm">
                                                        {p.User?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm tracking-tight">{p.User?.name}</div>
                                                        <div className="text-[10px] text-[var(--text-secondary)] font-medium">{p.User?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-sm font-bold tracking-tight">{p.Contract?.title || 'Fatura Única'}</div>
                                                <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-tight">{p.description}</div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold">
                                                {new Date(p.dueDate).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold">
                                                R$ {Number(p.amount).toLocaleString('pt-BR')}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg border shadow-sm ${p.status === 'paid' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-100'
                                                    }`}>
                                                    {p.status === 'paid' ? 'Liquidado' : 'Aguardando'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {p.status === 'pending' && (
                                                        <button
                                                            onClick={() => handlePayDebt(p.id)}
                                                            className="p-2 bg-navy-900 text-gold rounded-lg hover:bg-gold hover:text-navy-900 transition-all shadow-sm"
                                                            title="Dar Baixa"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setEditingPayment(p);
                                                            setEditForm({
                                                                amount: p.amount,
                                                                dueDate: p.dueDate.split('T')[0],
                                                                description: p.description,
                                                                status: p.status
                                                            });
                                                            setShowEditModal(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-navy-900 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePayment(p.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm transition-all"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {filteredPayments.length === 0 && (
                            <div className="p-20 text-center text-slate-400 font-black uppercase tracking-[0.4em]">
                                Nenhum registro financeiro encontrado
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* EDIT MODAL */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white">
                            <div className="bg-navy-900 p-8 text-white flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold font-heading tracking-tight">Editar Fatura</h3>
                                    <p className="text-gold text-[10px] font-bold uppercase tracking-widest">Ajuste de Registro Financeiro</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all relative z-10"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleUpdatePayment} className="p-8 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Descrição</label>
                                    <input
                                        type="text" required
                                        value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Valor (R$)</label>
                                        <input
                                            type="number" step="0.01" required
                                            value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-black transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Status</label>
                                        <select
                                            value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                            className="select-premium font-bold"
                                        >
                                            <option value="pending">Aguardando</option>
                                            <option value="paid">Liquidado</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Data de Vencimento</label>
                                    <input
                                        type="date" required
                                        value={editForm.dueDate} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                                        className="input-premium font-bold transition-all"
                                    />
                                </div>
                                <button type="submit" className="w-full btn-primary py-5 font-bold text-lg mt-4 shadow-xl shadow-gold/20">Salvar Alterações</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </SystemLayout>
    );
};

export default AdminFinances;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  X, 
  Briefcase, 
  Users, 
  Mail, 
  Phone, 
  TrendingUp,
  UserPlus,
  Edit2,
  Trash2,
  ShieldCheck,
  FileText
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { maskPhone, maskCPF, sanitizeValue } from '../utils/masks';
import PartnerContractModal from '../components/PartnerContractModal';

const PartnerManagement = () => {
  const { success, error, confirm } = useNotification();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPartner, setEditingPartner] = useState(null);
  const [selectedPartnerForContract, setSelectedPartnerForContract] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/partners');
      setPartners(res.data);
    } catch (err) {
      error('Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRegister = () => {
    setEditingPartner(null);
    setForm({ name: '', email: '', password: '', phone: '', cpf: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (partner) => {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      email: partner.email,
      password: '',
      phone: maskPhone(partner.phone || ''),
      cpf: maskCPF(partner.cpf || '')
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedForm = {
      ...form,
      cpf: sanitizeValue(form.cpf),
      phone: sanitizeValue(form.phone)
    };

    try {
      if (editingPartner) {
        await api.put(`/admin/partners/${editingPartner.id}`, sanitizedForm);
        success('Parceiro atualizado!');
      } else {
        await api.post('/admin/register-partner', sanitizedForm);
        success('Parceiro cadastrado com sucesso!');
      }
      setShowModal(false);
      setForm({ name: '', email: '', password: '', phone: '', cpf: '' });
      fetchData();
    } catch (err) {
      error(err.response?.data?.error || 'Erro ao processar solicitação');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Excluir Parceiro',
      message: 'Tem certeza que deseja remover este parceiro? Esta ação não afetará os clientes já vinculados.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/partners/${id}`);
          success('Parceiro removido');
          fetchData();
        } catch (err) {
          error('Erro ao excluir parceiro');
        }
      }
    });
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SystemLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Gestão de Parceiros</h1>
            <p className="text-[var(--text-secondary)] font-medium tracking-tight">Gerencie sua rede de vendas e franqueados.</p>
          </div>
          <button
            onClick={handleOpenRegister}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Novo Parceiro
          </button>
        </div>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar parceiro por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-gold transition-all font-medium"
            />
          </div>
          <div className="card-premium p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center">
              <Briefcase size={22} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400">Total Parceiros</p>
              <p className="text-xl font-black">{partners.length}</p>
            </div>
          </div>
        </div>

        {/* Partners Table */}
        <div className="card-premium overflow-hidden border border-[var(--border-primary)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-primary)] text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Parceiro</th>
                  <th className="px-8 py-5">Contato</th>
                  <th className="px-8 py-5">Carteira</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-400">Carregando parceiros...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--bg-primary)]/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-gold font-black shadow-inner">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold tracking-tight">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Parceiro Oficial</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
                          <Mail size={12} className="text-gold" /> {p.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
                          <Phone size={12} className="text-gold" /> {maskPhone(p.phone || '') || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold/5 text-gold rounded-lg border border-gold/10">
                          <Users size={16} />
                        </div>
                        <div className="text-sm font-black">{p.Clients?.length || 0} Clientes</div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedPartnerForContract(p);
                            setShowContractModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                          title="Gerenciar Contrato"
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar Parceiro"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir Parceiro"
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
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="bg-navy-900 p-8 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black font-heading tracking-tight">
                    {editingPartner ? 'Editar Parceiro' : 'Cadastrar Novo Parceiro'}
                  </h3>
                  <p className="text-gold text-[10px] font-black uppercase tracking-widest font-medium">Rede de Vendas 2BI</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Nome do Parceiro / Empresa</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold transition-all"
                    placeholder="Ex: Consultoria ABC"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">E-mail de Acesso</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold transition-all"
                    placeholder="parceiro@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">
                      {editingPartner ? 'Nova Senha (opcional)' : 'Senha'}
                    </label>
                    <input
                      type="password"
                      required={!editingPartner}
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">Telefone / Whats</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: maskPhone(e.target.value)})}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">CPF do Parceiro</label>
                  <input
                    type="text"
                    value={form.cpf}
                    onChange={e => setForm({...form, cpf: maskCPF(e.target.value)})}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold transition-all"
                    placeholder="000.000.000-00"
                  />
                </div>

                <button type="submit" className="w-full btn-primary py-5 font-black text-lg mt-4 shadow-xl shadow-gold/20">
                  {editingPartner ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contract Modal */}
      <PartnerContractModal 
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        partner={selectedPartnerForContract}
      />
    </SystemLayout>
  );
};

export default PartnerManagement;

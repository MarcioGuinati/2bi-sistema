import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Calendar,
  Search,
  MoreVertical,
  Briefcase,
  Layers,
  LogOut,
  X,
  FileText,
  MessageSquare,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  CreditCard,
  Eye
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { success, error, confirm } = useNotification();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [activeTab, setActiveTab] = useState('crm'); // 'crm' or 'billing'

  // Billing State
  const [clientContracts, setClientContracts] = useState([]);
  const [clientPayments, setClientPayments] = useState([]);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({ title: '', value: '', billingCycle: 'monthly', startDate: new Date().toISOString().split('T')[0] });
  const [billingStats, setBillingStats] = useState({ totalActiveValue: 0, pendingAmount: 0, paidMonth: 0 });
  const [previewUrl, setPreviewUrl] = useState(null);

  // New Client Form State
  const [clientForm, setClientForm] = useState({
    name: '', email: '', password: '',
    phone: '', cpf: '', income: '',
    occupation: '', financialGoal: ''
  });

  // Client Detail State (CRM)
  const [notes, setNotes] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editingBillingContract, setEditingBillingContract] = useState(null);
  const [newContract, setNewContract] = useState({ title: '', url: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, statsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/billing/stats')
      ]);
      setClients(clientsRes.data);
      setBillingStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRegister = () => {
    setEditingClient(null);
    setClientForm({ name: '', email: '', password: '', phone: '', cpf: '', income: '', occupation: '', financialGoal: '' });
    setShowRegModal(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email,
      password: '',
      phone: client.phone || '',
      cpf: client.cpf || '',
      income: client.income || '',
      occupation: client.occupation || '',
      financialGoal: client.financialGoal || ''
    });
    setShowRegModal(true);
  };

  const handleSubmitClient = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, clientForm);
      } else {
        await api.post('/register-client', clientForm);
      }
      setShowRegModal(false);
      success(editingClient ? 'Cliente atualizado!' : 'Novo parceiro registrado com sucesso!');
      fetchData();
    } catch (err) { error('Erro ao processar solicitação'); }
  };

  const handleDeleteClient = (id) => {
    confirm({
      title: 'Remover Membro',
      message: 'Esta ação excluirá permanentemente o cliente e todos os seus vínculos financeiros. Deseja prosseguir?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/clients/${id}`);
          success('Cliente removido da base');
          fetchData();
        } catch (err) { error('Falha ao excluir cliente'); }
      }
    });
  };

  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    setActiveTab('crm');
    try {
      const [notesRes, billingContractsRes, paymentsRes] = await Promise.all([
        api.get(`/notes/${client.id}`),
        api.get(`/contracts/${client.id}`),
        api.get(`/payments/${client.id}`)
      ]);
      setNotes(notesRes.data);
      setClientContracts(billingContractsRes.data);
      setClientPayments(paymentsRes.data);
    } catch (err) { console.error('Error details'); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (editingNote) {
      const res = await api.put(`/notes/${editingNote.id}`, { content: newNote });
      setNotes(notes.map(n => n.id === editingNote.id ? res.data : n));
      setEditingNote(null);
    } else {
      const res = await api.post(`/notes/${selectedClient.id}`, { content: newNote });
      setNotes([res.data, ...notes]);
    }
    setNewNote('');
  };

  const handleDeleteNote = (id) => {
    confirm({
      title: 'Excluir Nota',
      message: 'Deseja remover esta anotação estratégica?',
      isDestructive: true,
      onConfirm: async () => {
        await api.delete(`/notes/${id}`);
        setNotes(notes.filter(n => n.id !== id));
        success('Nota removida');
      }
    });
  };

  const fetchBillingData = async (clientId) => {
    try {
      const [contractsRes, paymentsRes] = await Promise.all([
        api.get(`/contracts/${clientId}`),
        api.get(`/payments/${clientId}`)
      ]);
      setClientContracts(contractsRes.data);
      setClientPayments(paymentsRes.data);
    } catch (err) { console.error('Error fetching billing'); }
  };

  const generateContractPDF = (contract) => {
    const doc = new jsPDF();
    const client = selectedClient;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Background / Watermark
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text('2BI PLANEJAMENTO', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
    doc.restoreGraphicsState();

    // 2. Premium Header Bar
    doc.setFillColor(10, 25, 47); // Navy 900
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 20, 25);
    
    doc.setTextColor(197, 160, 89); // Gold
    doc.setFontSize(8);
    doc.text('ESTRATÉGIA • PATRIMÔNIO • INTELIGÊNCIA FINANCEIRA', 20, 32);

    // 3. Document ID / Date
    doc.setTextColor(100, 116, 139); // Slate 400
    doc.setFontSize(7);
    const docId = `REF: 2BI-${Date.now().toString().slice(-6)}`;
    doc.text(docId, pageWidth - 20, 25, { align: 'right' });
    doc.text(`GERADO EM: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 20, 30, { align: 'right' });

    let y = 60;

    // 4. Section: PARTES
    doc.setDrawColor(197, 160, 89); // Gold
    doc.setLineWidth(0.5);
    doc.line(20, y, 40, y);
    
    doc.setTextColor(10, 25, 47);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('I. DAS PARTES', 20, y + 8);
    
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    
    doc.text('CONTRATADA:', 20, y);
    doc.setFont('helvetica', 'bold');
    doc.text('2BI PLANEJAMENTO ESTRATÉGICO LTDA', 50, y);
    doc.setFont('helvetica', 'normal');
    doc.text('CNPJ: XX.XXX.XXX/0001-XX | Sede: Maringá - PR', 50, y + 5);
    
    y += 15;
    doc.text('CONTRATANTE:', 20, y);
    doc.setFont('helvetica', 'bold');
    doc.text(client.name.toUpperCase(), 50, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`CPF: ${client.cpf || 'NÃO INFORMADO'} | E-mail: ${client.email}`, 50, y + 5);

    // 5. Section: OBJETO
    y += 25;
    doc.line(20, y, 40, y);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 25, 47);
    doc.text('II. DO OBJETO', 20, y + 8);
    
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const objetoText = `O presente instrumento tem por objeto a prestação de serviços especializados de ${contract.title.toUpperCase()}, visando a otimização de fluxos, organização de ativos e o alinhamento estratégico reportado nas sessões de mentoria.`;
    const objectLines = doc.splitTextToSize(objetoText, pageWidth - 40);
    doc.text(objectLines, 20, y);

    // 6. Section: VALORES
    y += 30;
    doc.line(20, y, 40, y);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 25, 47);
    doc.text('III. VALORES E CONDIÇÕES', 20, y + 8);
    
    y += 18;
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(20, y - 5, pageWidth - 40, 25, 3, 3, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.text('Investimento acordado:', 30, y + 5);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(197, 160, 89);
    doc.text(`R$ ${Number(contract.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 30, y + 13);
    
    doc.setFontSize(10);
    doc.setTextColor(10, 25, 47);
    doc.text('CICLO:', 120, y + 5);
    doc.text(contract.billingCycle === 'monthly' ? 'MENSAL' : contract.billingCycle === 'annual' ? 'ANUAL' : 'PAGAMENTO ÚNICO', 120, y + 13);

    // 7. Signatures
    y = pageHeight - 60;
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(20, y, 90, y);
    doc.line(120, y, pageWidth - 20, y);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(client.name, 55, y + 5, { align: 'center' });
    doc.text('Contratante', 55, y + 10, { align: 'center' });
    
    doc.text('2BI PLANEJAMENTO', 155, y + 5, { align: 'center' });
    doc.text('Contratada', 155, y + 10, { align: 'center' });

    // 8. Footer
    doc.setFillColor(10, 25, 47);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('2BI PLANEJAMENTO ESTRATÉGICO FINACEIRO - WWW.2BI.ORIONCHAT.CLOUD', pageWidth / 2, pageHeight - 7, { align: 'center' });

    return doc;
  };

  const handleDownloadContract = (contract) => {
    const doc = generateContractPDF(contract);
    doc.save(`Contrato_${selectedClient.name}_${contract.title}.pdf`);
    success('Contrato baixado!');
  };

  const handlePreviewContract = (contract) => {
    const doc = generateContractPDF(contract);
    setPreviewUrl(doc.output('datauristring'));
  };

  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBillingContract) {
        await api.put(`/contracts/${editingBillingContract.id}`, contractForm);
        success('Plano atualizado!');
      } else {
        await api.post('/contracts', { ...contractForm, user_id: selectedClient.id });
        success('Contrato e cobrança vinculados!');
      }
      setShowContractModal(false);
      setEditingBillingContract(null);
      fetchBillingData(selectedClient.id);
    } catch (err) { error('Erro ao salvar faturamento'); }
  };

  const handlePayDebt = async (paymentId) => {
    try {
      await api.put(`/payments/${paymentId}/pay`);
      success('Pagamento baixado com sucesso!');
      fetchBillingData(selectedClient.id);
    } catch (err) { error('Erro ao baixar pagamento'); }
  };

  const handleDeleteContract = (id) => {
    confirm({
      title: 'Cancelar Contrato',
      message: 'Isso removerá o contrato e todo o histórico de cobranças pendentes. Prosseguir?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/contracts/${id}`);
          success('Contrato encerrado');
          fetchBillingData(selectedClient.id);
        } catch (err) { error('Erro ao encerrar contrato'); }
      }
    });
  };

  return (
    <SystemLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">Painel Gestor 2BI</h1>
            <p className="text-slate-400 font-medium tracking-tight">Gestão estratégica de parcerias e CRM.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleOpenRegister}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus size={20} /> Novo Cliente
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card-premium p-6 relative overflow-hidden">
            <div className="w-12 h-12 bg-navy-900 text-gold rounded-2xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Base Ativa</div>
            <div className="text-3xl font-black text-[var(--text-primary)]">{clients.length}</div>
          </div>
          <div className="card-premium p-6">
            <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center mb-4">
              <CreditCard size={24} />
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Receita Ativa</div>
            <div className="text-2xl font-black text-[var(--text-primary)]">R$ {Number(billingStats.totalActiveValue).toLocaleString()}</div>
          </div>
          <div className="card-premium p-6">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={24} />
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">A Receber</div>
            <div className="text-2xl font-black text-red-600">R$ {Number(billingStats.pendingAmount).toLocaleString()}</div>
          </div>
          <div className="bg-navy-900 p-6 rounded-3xl shadow-sm text-center">
            <div className="text-gold font-black text-xl mb-1 italic">R$ {Number(billingStats.paidMonth).toLocaleString()}</div>
            <div className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Recebido este Mês</div>
          </div>
        </div>

        {/* Client List */}
        <div className="card-premium overflow-hidden">
          <div className="p-8 border-b border-[var(--border-primary)] flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold font-heading">Base de Parceiros</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome..."
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-sm outline-none focus:border-gold"
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-primary)] text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Identificação</th>
                  <th className="px-8 py-5">Contato</th>
                  <th className="px-8 py-5">Entrada</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--bg-primary)] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div onClick={() => handleSelectClient(c)} className="w-10 h-10 rounded-full bg-navy-900 text-gold flex items-center justify-center font-bold cursor-pointer">
                          {c.name.charAt(0)}
                        </div>
                        <div className="cursor-pointer" onClick={() => handleSelectClient(c)}>
                          <div className="font-bold text-sm">{c.name}</div>
                          <div className="text-[10px] text-gold font-black uppercase italic">Membro Premium</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-bold text-[var(--text-primary)]/70">{c.email}</div>
                      <div className="text-xs text-[var(--text-secondary)] font-medium">{c.phone || 'N/A'}</div>
                    </td>
                    <td className="px-8 py-5 text-sm text-[var(--text-secondary)] font-medium">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleSelectClient(c)} className="p-2 text-slate-400 hover:text-navy-900 rounded-lg bg-[var(--bg-secondary)] shadow-sm border border-[var(--border-primary)]"><MessageSquare size={16} /></button>
                        <button onClick={() => handleOpenEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg bg-[var(--bg-secondary)] shadow-sm border border-[var(--border-primary)]"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteClient(c.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg bg-[var(--bg-secondary)] shadow-sm border border-[var(--border-primary)]"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)]/90 backdrop-blur-xl rounded-[1.5rem] md:rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/40">
              <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-10 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black font-heading tracking-tight italic">{editingClient ? 'Ajustar Perfil' : 'Novo Alinhamento'}</h3>
                  <p className="text-gold/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Estratégia e Patrimônio 2BI</p>
                </div>
                <button onClick={() => setShowRegModal(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmitClient} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Nome Completo</label>
                    <input type="text" required value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">E-mail de Acesso</label>
                    <input type="email" required value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Documento (CPF)</label>
                    <input type="text" value={clientForm.cpf} onChange={e => setClientForm({ ...clientForm, cpf: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Telefone Whatsapp</label>
                    <input type="text" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Renda Mensal Estimada</label>
                    <input type="number" value={clientForm.income} onChange={e => setClientForm({ ...clientForm, income: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all font-black text-[var(--text-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Profissão / Cargo</label>
                    <input type="text" value={clientForm.occupation} onChange={e => setClientForm({ ...clientForm, occupation: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Principais Objetivos Estratégicos</label>
                  <textarea rows="3" value={clientForm.financialGoal} onChange={e => setClientForm({ ...clientForm, financialGoal: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all resize-none text-[var(--text-primary)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Senha de Acesso</label>
                  <input type="password" placeholder={editingClient ? 'Deixe em branco para manter' : 'Crie uma senha segura'} required={!editingClient} value={clientForm.password} onChange={e => setClientForm({ ...clientForm, password: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all" />
                </div>
                <button type="submit" className="w-full btn-primary py-5 font-black text-lg mt-6 shadow-xl shadow-gold/20">Finalizar Configuração</button>
              </form>
            </motion.div>
          </div>
        )}

        {selectedClient && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-10">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[var(--bg-secondary)]/80 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[3rem] w-full max-w-6xl h-full lg:h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/40">
              {/* Left Column: Profile */}
              <div className="w-full md:w-80 bg-navy-900/5 p-8 border-r border-navy-900/10 overflow-y-auto flex flex-col">
                <button onClick={() => setSelectedClient(null)} className="mb-8 flex items-center gap-3 text-slate-400 hover:text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest transition-all">
                  <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center shadow-sm"><X size={14} /></div> Voltar
                </button>
                <div className="text-center mb-10">
                  <div className="w-32 h-32 bg-gradient-to-tr from-gold to-yellow-300 rounded-[3rem] mx-auto mb-6 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-gold/30">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <h3 className="font-black font-heading text-2xl tracking-tight">{selectedClient.name}</h3>
                  <p className="text-[10px] text-gold font-black uppercase tracking-[0.3em] mt-2 inline-block px-4 py-1 bg-gold/10 rounded-full italic">Sócio Estratégico</p>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2rem] border border-[var(--border-primary)] shadow-sm">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Patrimônio / Renda</p>
                    <p className="text-2xl font-black text-[var(--text-primary)]">R$ {Number(selectedClient.income || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-navy-900 p-6 rounded-[2rem] text-white shadow-xl shadow-navy-900/20">
                    <p className="text-[10px] uppercase font-black text-white/30 mb-2">Contato</p>
                    <p className="text-xs font-bold truncate">{selectedClient.email}</p>
                    <p className="text-xs font-bold mt-1 text-gold">{selectedClient.phone}</p>
                  </div>
                </div>
              </div>
              {/* Right Column: CRM & Billing */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs Header */}
                <div className="flex bg-[var(--bg-secondary)]/50 border-b border-[var(--border-primary)] backdrop-blur-sm sticky top-0 z-10">
                  <button
                    onClick={() => setActiveTab('crm')}
                    className={`flex-1 px-8 py-6 font-black text-[10px] uppercase tracking-[0.3em] transition-all relative ${activeTab === 'crm' ? 'text-[var(--text-primary)]' : 'text-slate-400 hover:text-[var(--text-primary)]'}`}
                  >
                    CRM & Notas
                    {activeTab === 'crm' && <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`flex-1 px-8 py-6 font-black text-[10px] uppercase tracking-[0.3em] transition-all relative ${activeTab === 'billing' ? 'text-[var(--text-primary)]' : 'text-slate-400 hover:text-[var(--text-primary)]'}`}
                  >
                    Faturamento & Contratos
                    {activeTab === 'billing' && <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />}
                  </button>
                </div>

                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                  {activeTab === 'crm' ? (
                    <div className="grid grid-cols-1 gap-10">
                      <div className="space-y-8">
                        <h3 className="text-2xl font-black text-[var(--text-primary)] font-heading flex items-center gap-3">
                          <MessageSquare className="text-gold" size={24} /> Histórico Estratégico
                        </h3>
                        <form onSubmit={handleAddNote} className="space-y-3">
                          <textarea 
                            placeholder="Anotar próximo passo..." 
                            value={newNote} 
                            onChange={e => setNewNote(e.target.value)} 
                            className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl outline-none focus:border-gold text-sm h-32 text-[var(--text-primary)]" 
                          />
                          <div className="flex gap-2">
                             <button type="submit" className="flex-1 btn-primary py-3 font-bold text-xs uppercase tracking-widest">
                               {editingNote ? 'Atualizar Nota' : 'Registrar Contato'}
                             </button>
                             {editingNote && (
                               <button 
                                 type="button" 
                                 onClick={() => { setEditingNote(null); setNewNote(''); }}
                                 className="px-6 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl text-[10px] uppercase font-black tracking-widest"
                               >
                                 Cancelar
                               </button>
                             )}
                          </div>
                        </form>
                        <div className="space-y-4">
                          {notes.map(n => (
                            <div key={n.id} className="p-6 bg-[var(--bg-secondary)]/40 border border-[var(--border-primary)] rounded-[2rem] shadow-sm backdrop-blur-sm group hover:border-gold/30 transition-all">
                              <div className="flex justify-between items-start mb-3">
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-semibold italic">"{n.content}"</p>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => { setEditingNote(n); setNewNote(n.content); }}
                                     className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                                   >
                                     <Edit2 size={12} />
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteNote(n.id)}
                                     className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                   >
                                     <Trash2 size={12} />
                                   </button>
                                </div>
                              </div>
                              <div className="pt-4 border-t border-[var(--border-primary)] text-[10px] font-black uppercase text-gold tracking-widest flex justify-between items-center">
                                <span className="flex items-center gap-2"><Calendar size={12} /> {new Date(n.createdAt).toLocaleString()}</span>
                                <div className="bg-navy-900 text-white px-3 py-1 rounded-lg text-[8px] tracking-[0.2em]">Consultor: {n.Admin?.name}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-[var(--text-primary)] font-heading flex items-center gap-3">
                          <Briefcase className="text-gold" size={24} /> Planos Contratados
                        </h3>
                        <button
                          onClick={() => setShowContractModal(true)}
                          className="btn-primary py-3 px-6 text-xs flex items-center gap-2"
                        >
                          <Plus size={16} /> Vincular Produto
                        </button>
                      </div>

                      {/* Active Contracts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {clientContracts.map(c => (
                          <div key={c.id} className="card-premium p-6 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-black text-[var(--text-primary)] text-lg uppercase tracking-tight">{c.title}</h4>
                                <p className="text-[10px] font-black text-gold uppercase tracking-widest">{c.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}</p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingBillingContract(c);
                                    setContractForm({
                                      title: c.title,
                                      value: c.value,
                                      billingCycle: c.billingCycle,
                                      startDate: c.startDate.split('T')[0]
                                    });
                                    setShowContractModal(true);
                                  }}
                                  className="text-slate-400 hover:text-blue-500 transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteContract(c.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                              <div className="text-2xl font-black text-[var(--text-primary)]">R$ {Number(c.value).toLocaleString('pt-BR')}</div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePreviewContract(c)}
                                  className="p-3 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-xl hover:bg-gold transition-all shadow-sm border border-[var(--border-primary)]"
                                  title="Visualizar Contrato"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => handleDownloadContract(c)}
                                  className="p-3 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-xl hover:bg-gold transition-all shadow-sm border border-[var(--border-primary)]"
                                  title="Baixar PDF"
                                >
                                  <FileText size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Billing History */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-black text-[var(--text-primary)] font-heading flex items-center gap-3">
                          <CreditCard className="text-gold" size={24} /> Histórico de Debitos
                        </h3>
                        <div className="card-premium overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-[var(--bg-primary)] text-[10px] font-black uppercase text-slate-400">
                              <tr>
                                <th className="px-8 py-6 tracking-[0.2em]">Vencimento</th>
                                <th className="px-8 py-6 tracking-[0.2em]">Descrição</th>
                                <th className="px-8 py-6 tracking-[0.2em]">Valor</th>
                                <th className="px-8 py-6 tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-right tracking-[0.2em]">Fluxo</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)]">
                              {clientPayments.map(p => (
                                <tr key={p.id} className="hover:bg-gold/5 transition-colors">
                                  <td className="px-8 py-6 text-xs font-black italic">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</td>
                                  <td className="px-8 py-6 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight">{p.description}</td>
                                  <td className="px-8 py-6 text-sm font-black underline decoration-gold/30">R$ {Number(p.amount).toLocaleString('pt-BR')}</td>
                                  <td className="px-8 py-6">
                                    <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border shadow-sm ${p.status === 'paid' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20 animate-pulse'}`}>
                                      {p.status === 'paid' ? 'Liquidado' : 'Em Aberto'}
                                    </span>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                    {p.status === 'pending' && (
                                      <button onClick={() => handlePayDebt(p.id)} className="btn-primary py-2 px-4 text-[8px] uppercase tracking-widest shadow-lg shadow-gold/20">Regularizar</button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW CONTRACT MODAL */}
      <AnimatePresence>
        {showContractModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)]/90 backdrop-blur-xl rounded-[1.5rem] md:rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/40">
              <div className="bg-gradient-to-r from-gold to-yellow-500 p-8 text-navy-900 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black font-heading tracking-tight italic">{editingBillingContract ? 'Ajustar Plano' : 'Vincular Produto'}</h3>
                  <p className="text-navy-900/50 text-[10px] font-black uppercase tracking-[0.3em]">Acordo de Prestação 2BI</p>
                </div>
                <button onClick={() => setShowContractModal(false)} className="bg-navy-900/10 hover:bg-navy-900/20 p-2 rounded-xl transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleBillingSubmit} className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Nome do Produto ou Serviço</label>
                  <input
                    type="text" required placeholder="Ex: Gestão Patrimonial"
                    value={contractForm.title} onChange={e => setContractForm({ ...contractForm, title: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Valor do Contrato (R$)</label>
                    <input
                      type="number" required placeholder="0.00"
                      value={contractForm.value} onChange={e => setContractForm({ ...contractForm, value: e.target.value })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-black transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Recorrência</label>
                    <select
                      value={contractForm.billingCycle} onChange={e => setContractForm({ ...contractForm, billingCycle: e.target.value })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none font-bold transition-all"
                    >
                      <option value="monthly">Mensal</option>
                      <option value="annual">Anual</option>
                      <option value="once">Único</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Início da Vigência / 1º Vencimento</label>
                  <input
                    type="date" required
                    value={contractForm.startDate} onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none font-bold transition-all"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-5 font-black text-lg mt-4 shadow-xl shadow-gold/20">
                  {editingBillingContract ? 'Salvar Alterações' : 'Registrar e Ativar Plano'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTRACT PREVIEW MODAL */}
      <AnimatePresence>
        {previewUrl && (
          <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-md z-[70] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-[var(--bg-secondary)] rounded-[3rem] w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
              <div className="bg-navy-900 p-8 text-white flex justify-between items-center shadow-lg">
                <div>
                  <h3 className="text-2xl font-black font-heading tracking-tight italic">Visualização do Contrato</h3>
                  <p className="text-gold/50 text-[10px] font-black uppercase tracking-[0.3em]">Documento Oficial 2BI Planejamento</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setPreviewUrl(null)} className="p-3 px-6 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <X size={18} /> Fechar
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-800 p-4">
                <iframe src={previewUrl} className="w-full h-full rounded-2xl shadow-inner bg-white" title="Contract Preview" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SystemLayout>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye,
  EyeOff,
  Bell,
  Megaphone,
  Trophy,
  Star,
  Activity
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { maskCPF, maskPhone, maskCurrency, sanitizeValue } from '../utils/masks';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, impersonate } = useAuth();
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
  const [contractForm, setContractForm] = useState({ 
    title: '', 
    setupValue: '0', 
    monthlyValue: '0', 
    billingCycle: 'monthly', 
    startDate: new Date().toISOString().split('T')[0],
    recurrence: 1 
  });
  const [billingStats, setBillingStats] = useState({ totalActiveValue: 0, pendingAmount: 0, paidMonth: 0 });
  const [previewUrl, setPreviewUrl] = useState(null);

  // New Client Form State
  const [clientForm, setClientForm] = useState({
    name: '', email: '', password: '',
    phone: '', cpf: '', income: maskCurrency('0'),
    occupation: '', financialGoal: '',
    customFields: []
  });

  // Client Detail State (CRM)
  const [notes, setNotes] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editingBillingContract, setEditingBillingContract] = useState(null);
  const [newContract, setNewContract] = useState({ title: '', url: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: false,
    active: true,
    link: ''
  });

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
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/admin/announcements');
      setAnnouncements(res.data);
    } catch (err) { console.error('Error fetching announcements'); }
  };

  const handleOpenRegister = () => {
    setEditingClient(null);
    setClientForm({ name: '', email: '', password: '', phone: '', cpf: '', income: maskCurrency('0'), occupation: '', financialGoal: '', customFields: [] });
    setShowRegModal(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email,
      password: '',
      phone: maskPhone(client.phone || ''),
      cpf: maskCPF(client.cpf || ''),
      income: maskCurrency(client.income || '0'),
      occupation: client.occupation || '',
      financialGoal: client.financialGoal || '',
      customFields: client.customFields || []
    });
    setShowRegModal(true);
  };

  const handleSubmitClient = async (e) => {
    e.preventDefault();
    const sanitizedForm = {
      ...clientForm,
      cpf: sanitizeValue(clientForm.cpf),
      phone: sanitizeValue(clientForm.phone),
      income: sanitizeValue(clientForm.income)
    };

    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, sanitizedForm);
      } else {
        await api.post('/register-client', sanitizedForm);
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

  const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const generateContractPDF = async (contract) => {
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
    
    // 2.1 Logo
    try {
      const logo = await preloadImage('/logo_2bi.png');
      // Position logo at the left
      doc.addImage(logo, 'PNG', 20, 8, 20, 20);
    } catch (err) {
      console.error('Erro ao carregar logo para o PDF (Admin):', err);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 45, 25);
    
    doc.setTextColor(197, 160, 89); // Gold
    doc.setFontSize(8);
    doc.text('ESTRATÉGIA • PATRIMÔNIO • INTELIGÊNCIA FINANCEIRA', 45, 32);

    // 3. Document ID / Date
    doc.setTextColor(100, 116, 139); // Slate 400
    doc.setFontSize(7);
    const docId = `REF: 2BI-${Date.now().toString().slice(-6)}`;
    doc.text(docId, pageWidth - 20, 15, { align: 'right' });
    doc.text(`GERADO EM: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 20, 20, { align: 'right' });
    
    // Summary of Fees for the header logic
    const hasSetup = Number(contract.setupValue) > 0;
    const hasMonthly = Number(contract.monthlyValue) > 0;

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
    
    // Setup Box
    if (hasSetup) {
      doc.setFillColor(248, 250, 252); 
      doc.roundedRect(20, y - 5, (pageWidth - 40) / (hasMonthly ? 2.1 : 1), 25, 3, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Taxa de Implementação (Setup):', 30, y + 5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(197, 160, 89);
      doc.text(`R$ ${Number(contract.setupValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 30, y + 13);
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('* Taxa de Implementação (Setup) Isenta', 20, y + 5);
    }
    
    // Monthly Box
    if (hasMonthly) {
      const startX = hasSetup ? (pageWidth / 2) + 5 : 20;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(startX, y - 5, (pageWidth - 40) / (hasSetup ? 2.1 : 1), 25, 3, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(10, 25, 47);
      doc.text(`Mensalidade (${contract.recurrence} Meses):`, startX + 10, y + 5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(197, 160, 89);
      doc.text(`R$ ${Number(contract.monthlyValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, startX + 10, y + 13);
    }
    
    y += 30;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text(`* Vigência iniciada em ${new Date(contract.startDate).toLocaleDateString('pt-BR')}.`, 20, y);

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

  const handleDownloadContract = async (contract) => {
    try {
      const doc = await generateContractPDF(contract);
      doc.save(`Contrato_${selectedClient.name}_${contract.title}.pdf`);
      success('Contrato baixado!');
    } catch (err) {
      console.error('Erro ao baixar contrato:', err);
      error('Falha ao gerar PDF.');
    }
  };

  const handlePreviewContract = async (contract) => {
    try {
      const doc = await generateContractPDF(contract);
      setPreviewUrl(doc.output('datauristring'));
    } catch (err) {
      console.error('Erro ao gerar preview:', err);
      error('Falha ao gerar visualização do contrato.');
    }
  };

  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBillingContract) {
        await api.put(`/contracts/${editingBillingContract.id}`, contractForm);
        success('Plano atualizado!');
      } else {
        await api.post('/contracts', { ...contractForm, user_id: selectedClient.id });
        success(`Contrato unificado ativado para ${selectedClient.name}!`);
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
      fetchData(); // Refresh main dashboard stats
    } catch (err) { error('Erro ao baixar pagamento'); }
  };

  const handleUnpayDebt = async (paymentId) => {
    confirm({
      title: 'Estornar Pagamento',
      message: 'Deseja marcar este pagamento como pendente novamente?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.put(`/payments/${paymentId}/unpay`);
          success('Pagamento estornado com sucesso');
          fetchBillingData(selectedClient.id);
          fetchData(); // Refresh main dashboard stats
        } catch (err) { error('Erro ao estornar pagamento'); }
      }
    });
  };

  const handleAnnSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnn) {
        await api.put(`/admin/announcements/${editingAnn.id}`, annForm);
        success('Aviso atualizado!');
      } else {
        await api.post('/admin/announcements', annForm);
        success('Novo aviso publicado aos parceiros!');
      }
      setShowAnnModal(false);
      fetchAnnouncements();
    } catch (err) { error('Erro ao salvar aviso'); }
  };

  const handleDeleteAnn = (id) => {
    confirm({
      title: 'Excluir Aviso',
      message: 'Esta informação deixará de aparecer para os clientes. Confirmar exclusão?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/announcements/${id}`);
          success('Aviso removido');
          fetchAnnouncements();
        } catch (err) { error('Erro ao excluir aviso'); }
      }
    });
  };

  const handleOpenAnnEdit = (ann) => {
    setEditingAnn(ann);
    setAnnForm({
      title: ann.title,
      content: ann.content,
      type: ann.type,
      priority: ann.priority,
      active: ann.active,
      link: ann.link || ''
    });
    setShowAnnModal(true);
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
              onClick={() => {
                setEditingAnn(null);
                setAnnForm({ title: '', content: '', type: 'info', priority: false, active: true, link: '' });
                setShowAnnModal(true);
              }}
              className="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] px-4 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[var(--bg-primary)] transition-all shadow-sm"
            >
              <Megaphone size={20} className="text-gold" /> Gerenciar Avisos
            </button>
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
          <div className="card-premium p-6 flex flex-col justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="text-gold font-black text-2xl mb-1 italic">R$ {Number(billingStats.paidMonth).toLocaleString()}</div>
            <div className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-widest">Recebido este Mês</div>
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
                          <div className="font-bold text-sm flex items-center gap-2">
                             {c.name}
                             {c.isLead && (
                               <span className="bg-gold text-[8px] font-black px-2 py-0.5 rounded text-navy-900 uppercase tracking-tighter shadow-sm">Lead Site</span>
                             )}
                          </div>
                          <div className="text-[10px] text-gold font-black uppercase italic">
                            {c.isActive ? 'Membro Premium' : 'Aguardando Ativação'}
                          </div>
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
                      <div className="flex justify-end gap-2 text-right">
                        <button 
                          onClick={async () => {
                            await impersonate(c.id);
                            navigate('/dashboard');
                          }} 
                          title="Monitorar Sistema"
                          className="p-2 text-slate-400 hover:text-gold rounded-lg bg-[var(--bg-secondary)] shadow-sm border border-[var(--border-primary)] transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/clients/${c.id}/onboarding`)} 
                          title="Ficha de Onboarding"
                          className="p-2 text-slate-400 hover:text-green-600 rounded-lg bg-[var(--bg-secondary)] shadow-sm border border-[var(--border-primary)] transition-all"
                        >
                          <FileText size={16} />
                        </button>
                        <button onClick={() => handleSelectClient(c)} className="p-2 text-slate-400 hover:text-gold rounded-lg bg-[var(--bg-secondary)] shadow-sm border border-[var(--border-primary)] transition-all" title="CRM e Mensagens"><MessageSquare size={16} /></button>
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
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 pt-20 md:p-4">
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
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Nome Completo <span className="text-red-500">*</span></label>
                    <input type="text" required value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">E-mail de Acesso <span className="text-red-500">*</span></label>
                    <input type="email" required value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Documento (CPF) <span className="text-red-500">*</span></label>
                    <input type="text" required value={clientForm.cpf} onChange={e => setClientForm({ ...clientForm, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Telefone Whatsapp <span className="text-red-500">*</span></label>
                    <input type="text" required value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Renda Mensal Estimada</label>
                    <input type="text" value={clientForm.income} onChange={e => setClientForm({ ...clientForm, income: maskCurrency(e.target.value) })} placeholder="R$ 0,00" className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all font-black text-[var(--text-primary)]" />
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

                {/* Custom Fields Section */}
                <div className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                  <div className="flex justify-between items-center px-2">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Campos Personalizados</h4>
                    <button 
                      type="button" 
                      onClick={() => setClientForm({ ...clientForm, customFields: [...clientForm.customFields, { name: '', value: '' }] })}
                      className="text-[10px] bg-gold/10 text-gold px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-gold hover:text-white transition-all flex items-center gap-2"
                    >
                      <Plus size={12} /> Adicionar
                    </button>
                  </div>
                  {clientForm.customFields.map((field, index) => (
                    <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className="flex-1 space-y-1">
                        <label className="text-[8px] uppercase font-black text-slate-400 ml-2">Nome do Campo</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Endereço" 
                          value={field.name} 
                          onChange={e => {
                            const newFields = [...clientForm.customFields];
                            newFields[index].name = e.target.value;
                            setClientForm({ ...clientForm, customFields: newFields });
                          }} 
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-3 rounded-xl outline-none focus:border-gold transition-all text-xs" 
                        />
                      </div>
                      <div className="flex-[2] space-y-1">
                        <label className="text-[8px] uppercase font-black text-slate-400 ml-2">Valor</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Rua das Flores, 123" 
                          value={field.value} 
                          onChange={e => {
                            const newFields = [...clientForm.customFields];
                            newFields[index].value = e.target.value;
                            setClientForm({ ...clientForm, customFields: newFields });
                          }} 
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-3 rounded-xl outline-none focus:border-gold transition-all text-xs" 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newFields = clientForm.customFields.filter((_, i) => i !== index);
                          setClientForm({ ...clientForm, customFields: newFields });
                        }}
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {clientForm.customFields.length === 0 && (
                    <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Nenhum campo extra adicionado.
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-2">
                    {(editingClient?.isLead && !editingClient?.isActive) ? 'Cadastrar Senha Definitiva' : 'Senha de Acesso'} 
                    {!editingClient && <span className="text-red-500">*</span>}
                    {(editingClient?.isLead && !editingClient?.isActive) && <span className="text-gold ml-2 font-bold">(Obrigatório para Ativar)</span>}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder={editingClient ? ((editingClient.isLead && !editingClient.isActive) ? 'Crie uma senha para o acesso' : 'Deixe em branco para manter') : 'Crie uma senha segura'} 
                      required={!editingClient || (editingClient.isLead && !editingClient.isActive)} 
                      value={clientForm.password} 
                      onChange={e => setClientForm({ ...clientForm, password: e.target.value })} 
                      className={`w-full bg-[var(--bg-primary)] border p-4 pr-12 rounded-2xl outline-none focus:border-gold transition-all text-[var(--text-primary)] ${(editingClient?.isLead && !editingClient?.isActive) ? 'border-gold/50' : 'border-[var(--border-primary)]'}`} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gold transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-5 font-black text-lg mt-6 shadow-xl shadow-gold/20">Finalizar Configuração</button>
              </form>
            </motion.div>
          </div>
        )}

        {selectedClient && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-0 md:p-4 lg:p-10 pt-16 md:pt-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[var(--bg-secondary)]/90 backdrop-blur-2xl rounded-none md:rounded-[3rem] w-full max-w-6xl h-full lg:h-[90vh] overflow-hidden shadow-2xl flex flex-col border-none md:border border-white/40"
            >
              {/* Premium Header - Replicating Adjust Profile Style */}
              <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 md:p-10 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 flex items-center gap-4 md:gap-8">
                  <div className="hidden md:flex w-20 h-20 bg-gradient-to-tr from-gold to-yellow-300 rounded-3xl items-center justify-center text-white text-3xl font-black shadow-2xl shadow-gold/30 shrink-0">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl md:text-3xl font-black font-heading tracking-tight italic leading-none text-white">{selectedClient.name}</h3>
                      <span className="hidden md:inline-block px-3 py-1 bg-gold/20 text-gold text-[8px] font-black uppercase tracking-widest rounded-full border border-gold/30">Sócio Estratégico</span>
                    </div>
                    <p className="text-gold/60 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Gestão Estratégica e CRM 2BI</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)} 
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all relative z-10"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Column: Essential Info - Responsive behavior */}
                <div className="w-full md:w-80 bg-navy-900/5 p-6 md:p-8 border-r border-navy-900/10 overflow-y-auto hidden md:flex flex-col gap-6">
                  <div className="space-y-4">
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-[2rem] border border-[var(--border-primary)] shadow-sm">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Patrimônio / Renda</p>
                      <p className="text-2xl font-black text-[var(--text-primary)]">R$ {Number(selectedClient.income || 0).toLocaleString('pt-BR')}</p>
                    </div>
                  {/* Custom Fields in Details View */}
                  {selectedClient.customFields && selectedClient.customFields.length > 0 && (
                    <div className="space-y-3">
                      {selectedClient.customFields.map((field, idx) => (
                        <div key={idx} className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-sm">
                          <p className="text-[8px] uppercase font-black text-slate-400 mb-1">{field.name}</p>
                          <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                    <div className="bg-navy-900 p-6 rounded-[2rem] text-white shadow-xl shadow-navy-900/20">
                      <p className="text-[10px] uppercase font-black text-white/30 mb-2">Contato Direto</p>
                      <p className="text-xs font-bold truncate opacity-80">{selectedClient.email}</p>
                      <p className="text-sm font-black mt-2 text-gold tracking-tight">{selectedClient.phone || '(No Phone)'}</p>
                    </div>
                    <div className="bg-gold/5 p-6 rounded-[2rem] border border-gold/10">
                      <p className="text-[10px] uppercase font-black text-gold/60 mb-2">Objetivos</p>
                      <p className="text-xs font-semibold text-[var(--text-secondary)] leading-relaxed italic line-clamp-4">
                        {selectedClient.financialGoal || "Duração de objetivos estratégicos não definidos."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: CRM & Billing */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Tabs Header - More Premium Style */}
                  <div className="flex bg-[var(--bg-secondary)]/80 border-b border-[var(--border-primary)] backdrop-blur-md sticky top-0 z-10 p-2 gap-2">
                    <button
                      onClick={() => setActiveTab('crm')}
                      className={`flex-1 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${activeTab === 'crm' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                      CRM & Notas
                    </button>
                    <button
                      onClick={() => setActiveTab('billing')}
                      className={`flex-1 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${activeTab === 'billing' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                      Faturamento & Contratos
                    </button>
                  </div>

                  <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-slate-50/50">
                    {activeTab === 'crm' ? (
                      <div className="max-w-4xl mx-auto space-y-10">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)] font-heading flex items-center gap-3">
                              <MessageSquare className="text-gold" size={24} /> Histórico Estratégico
                            </h3>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{notes.length} Registros</span>
                          </div>
                          
                          <form onSubmit={handleAddNote} className="bg-[var(--bg-secondary)] p-6 rounded-[2.5rem] border border-[var(--border-primary)] shadow-xl shadow-slate-200/50 space-y-4">
                            <textarea 
                              placeholder="Descreva o próximo passo ou detalhe do contato..." 
                              value={newNote} 
                              onChange={e => setNewNote(e.target.value)} 
                              className="w-full p-6 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-3xl outline-none focus:border-gold/50 transition-all text-sm h-32 text-[var(--text-primary)] resize-none" 
                            />
                            <div className="flex gap-3">
                               <button type="submit" className="flex-1 btn-primary py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                                 {editingNote ? 'Atualizar Evolução' : 'Registrar Interação'}
                               </button>
                               {editingNote && (
                                 <button 
                                   type="button" 
                                   onClick={() => { setEditingNote(null); setNewNote(''); }}
                                   className="px-8 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl text-[10px] uppercase font-black tracking-widest hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]"
                                 >
                                   Cancelar
                                 </button>
                               )}
                            </div>
                          </form>

                          <div className="space-y-6 relative before:absolute before:left-8 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-gold/50 before:to-transparent">
                            {notes.map((n, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={n.id} 
                                className="pl-16 relative group"
                              >
                                <div className="absolute left-6 top-6 w-4 h-4 bg-white border-2 border-gold rounded-full z-10 group-hover:scale-125 transition-transform"></div>
                                <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[2rem] shadow-sm group-hover:shadow-md group-hover:border-gold/30 transition-all">
                                  <div className="flex justify-between items-start mb-4">
                                    <p className="text-sm md:text-base text-[var(--text-primary)] leading-relaxed font-medium">"{n.content}"</p>
                                    <div className="flex gap-2">
                                       <button 
                                         onClick={() => { setEditingNote(n); setNewNote(n.content); }}
                                         className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                       >
                                         <Edit2 size={14} />
                                       </button>
                                       <button 
                                         onClick={() => handleDeleteNote(n.id)}
                                         className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                       >
                                         <Trash2 size={14} />
                                       </button>
                                    </div>
                                  </div>
                                  <div className="pt-4 border-t border-slate-50 flex flex-wrap justify-between items-center gap-4">
                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase text-gold tracking-widest">
                                      <Calendar size={12} /> {new Date(n.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-navy-900 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                        {n.Admin?.name?.charAt(0) || 'A'}
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Responsável: {n.Admin?.name || 'Administrador'}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-5xl mx-auto space-y-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <h3 className="text-2xl font-black text-[var(--text-primary)] font-heading flex items-center gap-3">
                            <Briefcase className="text-gold" size={24} /> Planos Contratados
                          </h3>
                          <button
                            onClick={() => setShowContractModal(true)}
                            className="w-full md:w-auto btn-primary py-4 px-8 text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-gold/20"
                          >
                            <Plus size={18} /> Novo Contrato
                          </button>
                        </div>
  
                        {/* Active Contracts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {clientContracts.map(c => (
                            <div key={c.id} className="bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--border-primary)] shadow-sm hover:shadow-xl hover:border-gold/20 transition-all group">
                              <div className="flex justify-between items-start mb-6">
                                <div>
                                  <span className="text-[8px] font-black text-gold uppercase tracking-[0.3em] px-3 py-1 bg-gold/10 rounded-full">{c.billingCycle === 'monthly' ? 'Mensalidade' : 'Anuidade'}</span>
                                  <h4 className="font-black text-[var(--text-primary)] text-xl mt-2 tracking-tight group-hover:text-gold transition-colors">{c.title}</h4>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => handleDeleteContract(c.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acordo Total (Setup+Mes)</p>
                                  <div className="text-3xl font-black text-[var(--text-primary)]">R$ {Number(c.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                  <div className="flex gap-2 mt-1">
                                    {Number(c.setupValue) > 0 && <span className="text-[8px] font-bold text-gold uppercase tracking-tighter">Setup: R${Number(c.setupValue).toLocaleString()}</span>}
                                    {Number(c.monthlyValue) > 0 && <span className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">Mensal: R${Number(c.monthlyValue).toLocaleString()}</span>}
                                  </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                  <button
                                    onClick={() => handlePreviewContract(c)}
                                    className="flex-1 md:flex-none p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-2xl hover:bg-navy-900 hover:text-white transition-all shadow-sm border border-[var(--border-primary)] flex items-center justify-center gap-2"
                                    title="Visualizar Contrato"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadContract(c)}
                                    className="flex-1 md:flex-none p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-2xl hover:bg-gold hover:text-white transition-all shadow-sm border border-[var(--border-primary)] flex items-center justify-center gap-2"
                                    title="Baixar PDF"
                                  >
                                    <FileText size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {clientContracts.length === 0 && (
                            <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
                              <p className="text-slate-400 font-bold">Nenhum contrato ativo para este parceiro.</p>
                            </div>
                          )}
                        </div>

                        {/* Billing History */}
                        <div className="space-y-6">
                          <h3 className="text-xl font-black text-[var(--text-primary)] font-heading flex items-center gap-3">
                            <CreditCard className="text-gold" size={24} /> Histórico de Debitos
                          </h3>
                          <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-primary)] shadow-sm overflow-hidden">
                            <div className="table-responsive">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="bg-[var(--bg-primary)] text-[10px] font-black uppercase text-slate-400">
                                    <th className="px-8 py-6 tracking-[0.2em]">Vencimento</th>
                                    <th className="px-8 py-6 tracking-[0.2em]">Descrição</th>
                                    <th className="px-8 py-6 tracking-[0.2em]">Valor</th>
                                    <th className="px-8 py-6 tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-right tracking-[0.2em]">Ação</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-primary)]">
                                  {clientPayments.map(p => (
                                    <tr key={p.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors group">
                                      <td className="px-8 py-6 text-xs font-black text-[var(--text-primary)]">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</td>
                                      <td className="px-8 py-6">
                                        <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight">{p.description}</div>
                                        <div className="text-[8px] text-slate-400 font-medium">REF: {p.id.toString().slice(-6)}</div>
                                      </td>
                                      <td className="px-8 py-6 text-sm font-black text-[var(--text-primary)]">R$ {Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                      <td className="px-8 py-6">
                                        <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border shadow-sm ${p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse'}`}>
                                          {p.status === 'paid' ? 'Liquidado' : 'Aguardando'}
                                        </span>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                        {p.status === 'pending' && (
                                          <button 
                                            onClick={() => handlePayDebt(p.id)} 
                                            className="px-6 py-3 bg-gold text-white text-[8px] font-black uppercase tracking-widest rounded-xl hover:bg-gold-500 transition-all shadow-lg shadow-gold/20"
                                          >
                                            Dar Baixa
                                          </button>
                                        )}
                                        {p.status === 'paid' && (
                                          <button 
                                            onClick={() => handleUnpayDebt(p.id)} 
                                            className="px-6 py-3 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                          >
                                            Estornar
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW CONTRACT MODAL */}
      <AnimatePresence>
        {showContractModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)]/90 backdrop-blur-xl rounded-[1.5rem] md:rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/40">
              <div className="bg-gradient-to-r from-gold to-yellow-500 p-8 text-navy-900 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black font-heading tracking-tight italic text-navy-900">{editingBillingContract ? 'Ajustar Plano' : 'Vincular Produto'}</h3>
                  <p className="text-navy-900/50 text-[10px] font-black uppercase tracking-[0.3em]">Acordo de Prestação 2BI</p>
                </div>
                <button onClick={() => setShowContractModal(false)} className="bg-navy-900/10 hover:bg-navy-900/20 p-2 rounded-xl transition-all"><X size={20} /></button>
              </div>

              {/* Suggestions Section */}
              {!editingBillingContract && selectedClient && (
                <div className="px-8 pt-6 pb-2 grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setContractForm({ 
                      ...contractForm, 
                      title: 'Plano Estratégico 360 (Setup + Mensal)', 
                      setupValue: (Number(selectedClient.income || 0) * 12 * 0.02).toFixed(2),
                      monthlyValue: '49.90',
                      billingCycle: 'monthly',
                      recurrence: 12
                    })}
                    className="p-4 bg-navy-900 rounded-2xl border border-gold/20 cursor-pointer hover:bg-navy-800 transition-all flex flex-col items-center gap-1 group"
                  >
                    <span className="text-gold text-[8px] font-bold uppercase tracking-widest">Plano Completo (Setup + Mes)</span>
                    <span className="text-white text-xs font-black italic">R$ {(Number(selectedClient.income || 0) * 12 * 0.02 + 49.9).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div 
                    onClick={() => setContractForm({ 
                      ...contractForm, 
                      title: 'Mentoria Mensal (Setup Isento)', 
                      setupValue: '0',
                      monthlyValue: '49.90',
                      billingCycle: 'monthly',
                      recurrence: 12
                    })}
                    className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] cursor-pointer hover:border-gold/30 transition-all flex flex-col items-center gap-1 group"
                  >
                    <span className="text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-widest">Isentar Setup</span>
                    <span className="text-[var(--text-primary)] text-sm font-black italic">R$ 49,90/mês</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleBillingSubmit} className="p-8 space-y-6 pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Nome do Produto ou Serviço</label>
                  <input
                    type="text" required placeholder="Ex: Gestão Patrimonial"
                    value={contractForm.title} onChange={e => setContractForm({ ...contractForm, title: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Taxa Setup (R$)</label>
                    <input
                      type="number" required placeholder="0.00"
                      value={contractForm.setupValue} onChange={e => setContractForm({ ...contractForm, setupValue: e.target.value })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-black transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Mensalidade (R$)</label>
                    <input
                      type="number" required placeholder="0.00"
                      value={contractForm.monthlyValue} onChange={e => setContractForm({ ...contractForm, monthlyValue: e.target.value })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-black transition-all"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 lg:col-span-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Recorrência</label>
                    <select
                      value={contractForm.billingCycle} onChange={e => setContractForm({ ...contractForm, billingCycle: e.target.value })}
                      className="select-premium font-bold transition-all h-full"
                    >
                      <option value="monthly">Mensal</option>
                      <option value="annual">Anual</option>
                      <option value="once">Pagam. Único</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Início da Vigência</label>
                    <input
                      type="date" required
                      value={contractForm.startDate} onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })}
                      className="input-premium w-full font-bold transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Meses a Gerar (Mensalidade)</label>
                    <input
                      type="number" required min="1" max="60"
                      value={contractForm.recurrence} onChange={e => setContractForm({ ...contractForm, recurrence: Number(e.target.value) })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-black transition-all"
                    />
                  </div>
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
          <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-md z-[210] flex items-center justify-center p-6">
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
      <AnimatePresence>
        {showAnnModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-white/20 flex flex-col md:flex-row h-[90vh]">
              {/* Left Column: Management */}
              <div className="flex-1 p-8 border-r border-[var(--border-primary)] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black font-heading italic">{editingAnn ? 'Editar Comunicado' : 'Novo Comunicado'}</h3>
                  {!editingAnn && (
                    <div className="bg-gold/10 text-gold text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">Canal 2BI</div>
                  )}
                </div>

                <form onSubmit={handleAnnSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Título do Aviso</label>
                    <input type="text" required value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} className="input-premium" placeholder="Ex: Sistema Atualizado v2.0" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Tipo de Comunicado</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'info', label: 'Informativo', icon: Bell },
                        { id: 'update', label: 'Atualização', icon: Activity },
                        { id: 'promo', label: 'Promoção', icon: Megaphone },
                        { id: 'contest', label: 'Sorteio', icon: Trophy }
                      ].map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setAnnForm({ ...annForm, type: type.id })}
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${annForm.type === type.id ? 'border-gold bg-gold/10 text-gold' : 'border-[var(--border-primary)] text-slate-400 hover:border-slate-300'}`}
                        >
                          <type.icon size={20} />
                          <span className="text-[10px] font-black uppercase">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Conteúdo do Aviso</label>
                    <textarea required value={annForm.content} onChange={e => setAnnForm({ ...annForm, content: e.target.value })} className="input-premium h-32 resize-none" placeholder="O que você deseja comunicar aos seus clientes?" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Link Externo / Saiba Mais (Opcional)</label>
                    <input type="url" value={annForm.link} onChange={e => setAnnForm({ ...annForm, link: e.target.value })} className="input-premium" placeholder="https://..." />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${annForm.priority ? 'bg-gold text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Star size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">Prioridade Máxima</div>
                        <div className="text-[10px] text-slate-400">Exibir em destaque no topo do dashboard.</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setAnnForm({ ...annForm, priority: !annForm.priority })} className={`w-14 h-8 rounded-full relative transition-all ${annForm.priority ? 'bg-gold' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${annForm.priority ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${annForm.active ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Activity size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">Publicação Ativa</div>
                        <div className="text-[10px] text-slate-400">Controla se o aviso está visível para os clientes.</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setAnnForm({ ...annForm, active: !annForm.active })} className={`w-14 h-8 rounded-full relative transition-all ${annForm.active ? 'bg-green-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${annForm.active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 btn-primary py-4 font-black">{editingAnn ? 'Salvar Alterações' : 'Publicar Agora'}</button>
                    {editingAnn && (
                      <button type="button" onClick={() => handleDeleteAnn(editingAnn.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: Existing List & Preview */}
              <div className="w-full md:w-80 bg-[var(--bg-primary)] p-8 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Todos os Comunicados</h4>
                  <button onClick={() => setShowAnnModal(false)} className="text-slate-400"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                  {announcements.map(ann => (
                    <div key={ann.id} onClick={() => handleOpenAnnEdit(ann)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${editingAnn?.id === ann.id ? 'border-gold bg-white shadow-lg' : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-gold'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ann.active ? (ann.type === 'update' ? 'bg-blue-100 text-blue-600' : ann.type === 'promo' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600') : 'bg-slate-100 text-slate-400'}`}>
                          {ann.type === 'update' ? <Activity size={14} /> : ann.type === 'promo' ? <Megaphone size={14} /> : <Bell size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black truncate">{ann.title}</div>
                          <div className={`text-[8px] font-black uppercase tracking-widest ${ann.active ? 'text-green-500' : 'text-slate-400'}`}>
                            {ann.active ? 'Publicado' : 'Inativo'}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">{ann.content}</div>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <Activity size={24} />
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase font-black">Nenhum aviso ativo</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SystemLayout>
  );
};

export default AdminDashboard;

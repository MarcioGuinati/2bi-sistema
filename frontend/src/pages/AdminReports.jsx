import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FilePlus, 
  Send, 
  Trash2, 
  Search, 
  ChevronRight, 
  AlertCircle,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Download
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import reportGenerator from '../services/reportGenerator';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const AdminReports = () => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [publishedReports, setPublishedReports] = useState([]);
  
  // Generation state
  const [currentPreview, setCurrentPreview] = useState(null);
  const [consultantNote, setConsultantNote] = useState('');
  const [startDate, setStartDate] = useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [searchTerm, setSearchTerm] = useState('');

  const { success, error: notifyError, confirm } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, reportsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/reports')
      ]);
      setClients(clientsRes.data);
      setPublishedReports(reportsRes.data);
    } catch (err) {
      notifyError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedClient) return;
    try {
      setLoading(true);
      const [statsRes, categoryRes, goalsRes] = await Promise.all([
        api.get('/transactions/stats', { params: { userId: selectedClient.id, startDate, endDate } }),
        api.get('/transactions/dashboard-stats', { params: { userId: selectedClient.id, startDate, endDate } }),
        api.get('/goals', { params: { userId: selectedClient.id } }) // Assuming goals can be fetched by userId
      ]);

      setCurrentPreview({
        summary: statsRes.data,
        categories: categoryRes.data.categoryData || [],
        goals: goalsRes.data || []
      });
      success('Prévia gerada com sucesso');
    } catch (err) {
      notifyError('Erro ao gerar prévia');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedClient || !currentPreview) return;
    try {
      setPublishing(true);
      const payload = {
        user_id: selectedClient.id,
        title: `Relatório Estratégico - ${format(new Date(startDate), 'MMM/yyyy')}`,
        period_start: startDate,
        period_end: endDate,
        summary_data: currentPreview,
        consultant_note: consultantNote
      };

      await api.post('/reports', payload);
      success('Relatório publicado para o cliente!');
      setConsultantNote('');
      setCurrentPreview(null);
      fetchData(); // Refresh list
    } catch (err) {
      notifyError('Erro ao publicar relatório');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Excluir Relatório',
      message: 'Deseja excluir este relatório? O cliente não terá mais acesso.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/reports/${id}`);
          success('Relatório excluído');
          fetchData();
        } catch (err) {
          notifyError('Erro ao excluir');
        }
      }
    });
  };

  const handleDownload = (report) => {
    const fullData = {
      user: { name: report.client.name },
      summary: report.summary_data.summary,
      transactions: [],
      categories: report.summary_data.categories,
      goals: report.summary_data.goals,
      period: { start: report.period_start, end: report.period_end },
      consultant_note: report.consultant_note
    };
    reportGenerator.generateStrategicReport(fullData);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SystemLayout title="Gestão de Relatórios">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic tracking-tight text-[var(--text-primary)]">Publicar Relatórios</h1>
            <p className="text-[var(--text-secondary)] font-bold text-sm">Analise o desempenho dos seus clientes e publique pareceres oficiais.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Client Selection */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card-premium p-6 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-gold text-sm font-bold"
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredClients.map(client => (
                  <button 
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border ${selectedClient?.id === client.id ? 'bg-gold/10 border-gold shadow-lg' : 'bg-[var(--bg-secondary)] border-transparent hover:border-gold/30'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-black text-[var(--text-primary)] truncate">{client.name}</p>
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] truncate">{client.email}</p>
                    </div>
                    <ChevronRight size={16} className={selectedClient?.id === client.id ? "text-gold" : "text-[var(--text-secondary)]"} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Editor */}
          <div className="lg:col-span-8 space-y-6">
            {selectedClient ? (
              <div className="card-premium p-8 space-y-8 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-4 border-b border-[var(--border-primary)] pb-6">
                  <div className="p-3 bg-gold/10 rounded-2x-large text-gold">
                    <FilePlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)]">Novo Relatório para {selectedClient.name}</h3>
                    <p className="text-xs font-bold text-[var(--text-secondary)]">Configure o período e escreva seu parecer estratégico.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Início do Período</label>
                        <input 
                          type="date" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Fim do Período</label>
                        <input 
                          type="date" 
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold text-xs font-bold"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handlePreview}
                      className="w-full py-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-gold text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] rounded-2xl transition-all"
                    >
                      Gerar Prévia de Dados
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Parecer do Consultor (Personalizado)</label>
                    <textarea 
                      placeholder="Ex: Identificamos um custo elevado em lazer. Recomendamos..."
                      value={consultantNote}
                      onChange={(e) => setConsultantNote(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold text-xs font-bold min-h-[140px] resize-none"
                    />
                  </div>
                </div>

                {currentPreview && (
                  <div className="p-6 bg-gold/5 rounded-3xl border border-gold/10 space-y-6 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between border-b border-gold/10 pb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-gold italic">Prévia Consolidada</span>
                       <div className="flex gap-4">
                          <span className="text-[10px] font-bold text-green-500">Rec: R$ {currentPreview.summary.income.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-red-500">Des: R$ {currentPreview.summary.expense.toLocaleString()}</span>
                       </div>
                    </div>
                    
                    <div className="flex justify-end gap-4">
                      <button 
                        onClick={() => {
                           const fullData = {
                             user: { name: selectedClient.name },
                             summary: currentPreview.summary,
                             transactions: [],
                             categories: currentPreview.categories,
                             goals: currentPreview.goals,
                             period: { start: startDate, end: endDate },
                             consultant_note: consultantNote
                           };
                           reportGenerator.generateStrategicReport(fullData);
                        }}
                        className="px-6 py-3 border border-gold text-gold font-black text-[10px] uppercase rounded-xl hover:bg-gold/10 transition-all"
                      >
                        Ver PDF de Teste
                      </button>
                      <button 
                        onClick={handlePublish}
                        disabled={publishing}
                        className="px-8 py-3 bg-gold text-white font-black text-[10px] uppercase rounded-xl hover:bg-gold/90 shadow-lg shadow-gold/20 transition-all flex items-center gap-2"
                      >
                        {publishing ? 'Publicando...' : <><Send size={14} /> Publicar para o Cliente</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-premium h-full min-h-[500px] flex items-center justify-center flex-col p-20 text-center gap-6">
                <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-primary)]">
                  <Users size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[var(--text-primary)] uppercase">Selecione um Cliente</h3>
                  <p className="text-sm font-bold text-[var(--text-secondary)] max-w-sm">Escolha um cliente à esquerda para começar a análise estratégico-financeira e publicar seus relatórios.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="card-premium overflow-hidden">
          <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                  <Clock size={20} />
               </div>
               <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)] uppercase">Histórico de Publicações</h3>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Relatórios ativos na plataforma para os clientes.</p>
               </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)]">
                  <th className="p-6 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Relatório</th>
                  <th className="p-6 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Cliente</th>
                  <th className="p-6 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Publicado em</th>
                  <th className="p-6 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Parecer</th>
                  <th className="p-6 text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {publishedReports.map(report => (
                  <tr key={report.id} className="hover:bg-gold/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-gold" />
                        <span className="text-xs font-black text-[var(--text-primary)]">{report.title}</span>
                      </div>
                    </td>
                    <td className="p-6">
                       <span className="text-xs font-bold text-[var(--text-secondary)]">{report.client?.name}</span>
                    </td>
                    <td className="p-6 text-xs font-bold text-[var(--text-secondary)]">
                      {format(new Date(report.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-6">
                      {report.consultant_note ? (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-lg uppercase">Personalizado</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-500/10 text-slate-500 text-[10px] font-black rounded-lg uppercase">Automático</span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleDownload(report)}
                          className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-all"
                          title="Baixar PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(report.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
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
    </SystemLayout>
  );
};

export default AdminReports;

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Lock, 
  Database, 
  MessageCircle, 
  Save, 
  Zap,
  Info,
  Check,
  HelpCircle,
  Users,
  Search,
  Activity,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const AdminAIConfig = () => {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [usageData, setUsageData] = useState([]);
  const [detailedUsage, setDetailedUsage] = useState([]);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'
  const [activeTab, setActiveTab] = useState('monitor'); // 'monitor' or 'settings'
  const [searchTerm, setSearchTerm] = useState('');
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA'),
    end: new Date().toLocaleDateString('en-CA')
  });
  
  const [config, setConfig] = useState({
    openai_key: '',
    openai_model: 'gpt-3.5-turbo',
    ai_system_prompt: 'Você é um assistente financeiro pessoal de elite da 2BI Planejamento. Analise os dados e dê conselhos práticos, profissionais e encorajadores em português.'
  });

  const fetchData = async () => {
    try {
      const params = { startDate: dateRange.start, endDate: dateRange.end };
      const [configRes, usageRes, detailedRes] = await Promise.all([
        api.get('/admin/ai-config'),
        api.get('/admin/ai-usage', { params }),
        api.get('/admin/ai-usage-detailed', { params })
      ]);
      
      if (configRes.data) {
        setConfig(prev => ({ ...prev, ...configRes.data }));
      }
      if (usageRes.data) {
        setUsageData(usageRes.data);
      }
      if (detailedRes.data) {
        setDetailedUsage(detailedRes.data);
      }
    } catch (err) {
      console.error('Erro ao buscar dados de IA', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/admin/ai-config', config);
      success('Configurações de IA atualizadas com sucesso!');
    } catch (err) {
      error('Erro ao salvar configurações de IA');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsage = usageData.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDetailed = detailedUsage.filter(d => 
    d.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.User?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (fetching) {
    return (
      <SystemLayout>
        <div className="flex items-center justify-center h-full py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
        </div>
      </SystemLayout>
    );
  }

  return (
    <SystemLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-navy-900 rounded-[2.5rem] text-gold shadow-xl shadow-navy-900/10">
              <Zap size={40} />
            </div>
            <div>
              <h2 className="text-4xl font-black font-heading tracking-tight text-[var(--text-primary)]">Gestão de IA</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Configuração e Monitoramento de Uso</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-primary)] shadow-sm">
             <button 
                onClick={() => setActiveTab('monitor')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'monitor' ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20' : 'text-slate-400 hover:text-gold'}`}
             >
                <Activity size={16} />
                Monitor de Consumo
             </button>
             <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-slate-400 hover:text-navy-900'}`}
             >
                <Settings size={16} />
                Configurações
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === 'settings' ? (
            <>
              {/* Settings Column */}
              <div className="lg:col-span-2 space-y-8">
                <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] rounded-[3rem] border border-[var(--border-primary)] shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-navy-900/5">
                  <div className="p-10 space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h3 className="text-xl font-black text-[var(--text-primary)]">Parâmetros do Agente</h3>
                    </div>

                    <div className="space-y-4">
                       <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                         <Lock size={14} className="text-gold" /> OpenAI API Key
                       </label>
                       <input
                        type="password"
                        placeholder="sk-..."
                        value={config.openai_key || ''}
                        onChange={(e) => setConfig({...config, openai_key: e.target.value})}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-gold outline-none transition-all font-medium text-[var(--text-primary)]"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                         <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                           <Database size={14} className="text-gold" /> Modelo
                         </label>
                         <select
                           value={config.openai_model || 'gpt-3.5-turbo'}
                           onChange={(e) => setConfig({...config, openai_model: e.target.value})}
                           className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-gold outline-none transition-all font-medium text-[var(--text-primary)]"
                         >
                           <option value="gpt-4o-mini">GPT-4o Mini (Recomendado)</option>
                           <option value="gpt-4o">GPT-4o (Superior)</option>
                           <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                         </select>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                         <MessageCircle size={14} className="text-gold" /> DNA do Consultor (Prompt do Sistema)
                       </label>
                       <textarea
                        rows={6}
                        value={config.ai_system_prompt || ''}
                        onChange={(e) => setConfig({...config, ai_system_prompt: e.target.value})}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-gold outline-none transition-all font-medium text-[var(--text-primary)] resize-none"
                       />
                    </div>
                  </div>

                  <div className="p-8 bg-[var(--bg-primary)]/50 border-t border-[var(--border-primary)]">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 bg-navy-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-gold transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {loading ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Info Column */}
              <div className="space-y-6">
                <div className="bg-gold/5 border border-gold/20 rounded-[3rem] p-10 space-y-6">
                  <div className="flex items-center gap-3 text-gold">
                    <Info size={28} />
                    <h4 className="font-black text-sm uppercase tracking-wider">Gestão de Custos</h4>
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Cada relatório gerado pelo cliente consome tokens na sua conta da OpenAI. Use o monitor ao lado para identificar usuários com alto engajamento.
                  </p>
                  <div className="space-y-4">
                    {[
                      { label: 'GPT-4o Mini', desc: 'Rápido e incrivelmente barato.' },
                      { label: 'Monitoramento', desc: 'Controle quem está usando agora.' },
                      { label: 'Auditoria', desc: 'Histórico salvo para cada cliente.' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="mt-1"><Check size={16} className="text-green-500" /></div>
                        <div>
                            <div className="text-[10px] font-black uppercase text-[var(--text-primary)]">{item.label}</div>
                            <div className="text-[9px] text-slate-400 font-bold">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-navy-900 text-white rounded-[3rem] p-10 shadow-2xl shadow-navy-900/20">
                  <HelpCircle className="text-gold mb-6" size={32} />
                  <h4 className="font-black text-sm uppercase tracking-wider mb-2">Dica Estratégica</h4>
                  <p className="text-[11px] text-white/50 font-bold leading-relaxed">
                    Se o custo subir muito, você pode usar o monitor para identificar se algum cliente está gerando insights em excesso e ajustar sua consultoria.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-3">
               {/* Usage Monitor Section */}
               <div className="bg-[var(--bg-secondary)] rounded-[3rem] border border-[var(--border-primary)] shadow-sm overflow-hidden anim-fade-in">
                  <div className="p-10 border-b border-[var(--border-primary)] space-y-8">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-gold/10 text-gold rounded-2xl">
                                  <Activity size={24} />
                              </div>
                              <div>
                                  <h3 className="text-xl font-black text-[var(--text-primary)]">Monitor de Consumo</h3>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Performance de IA</p>
                              </div>
                          </div>

                          <div className="relative w-full md:w-64">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input 
                                  type="text"
                                  placeholder="Buscar cliente..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl py-3 pl-12 pr-4 text-xs outline-none focus:border-gold font-bold text-[var(--text-primary)]"
                              />
                          </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        {/* Tabs */}
                        <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-primary)] rounded-2xl w-fit">
                            <button 
                                onClick={() => setViewMode('summary')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'summary' ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20' : 'text-slate-400 hover:text-gold'}`}
                            >
                                Resumo por Cliente
                            </button>
                            <button 
                                onClick={() => setViewMode('detailed')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'detailed' ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20' : 'text-slate-400 hover:text-gold'}`}
                            >
                                Histórico Detalhado
                            </button>
                        </div>

                        {/* Date Filter */}
                        <div className="flex items-center gap-3 p-2 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] shadow-sm">
                            <div className="flex items-center gap-2 px-3">
                                <Calendar size={14} className="text-gold" />
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Filtrar Período</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                    className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg py-1.5 px-3 text-[10px] font-bold text-[var(--text-primary)] outline-none focus:border-gold"
                                />
                                <span className="text-slate-400 text-[10px]">até</span>
                                <input 
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                    className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg py-1.5 px-3 text-[10px] font-bold text-[var(--text-primary)] outline-none focus:border-gold"
                                />
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[400px]">
                      {viewMode === 'summary' ? (
                          <table className="w-full">
                              <thead>
                                  <tr className="bg-[var(--bg-primary)]/30">
                                      <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Cliente</th>
                                      <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Total Insights</th>
                                      <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Último Uso</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border-primary)]">
                                  {filteredUsage.map((u, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                          <td className="px-10 py-6">
                                              <div className="font-black text-[var(--text-primary)] tracking-tight">{u.name}</div>
                                              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{u.email}</div>
                                          </td>
                                          <td className="px-10 py-6 text-center">
                                              <span className="inline-flex items-center px-5 py-2.5 bg-gold/10 text-gold rounded-full text-xs font-black ring-1 ring-gold/20">
                                                  {u.total_insights}
                                              </span>
                                          </td>
                                          <td className="px-10 py-6 text-right">
                                              <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-500 uppercase">
                                                  <Calendar size={12} className="text-gold" />
                                                  {new Date(u.last_use).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                                  {filteredUsage.length === 0 && (
                                      <tr>
                                          <td colSpan="3" className="px-10 py-24 text-center">
                                              <div className="flex flex-col items-center gap-4 opacity-30">
                                                  <Users size={48} />
                                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhum registro encontrado</span>
                                              </div>
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      ) : (
                          <table className="w-full">
                              <thead>
                                  <tr className="bg-[var(--bg-primary)]/30">
                                      <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Data e Hora</th>
                                      <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Cliente</th>
                                      <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Referência</th>
                                      <th className="px-10 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Tipo de Uso</th>
                                      <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border-primary)]">
                                  {filteredDetailed.map((d, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                          <td className="px-10 py-6">
                                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                                  <Calendar size={12} className="text-gold" />
                                                  {new Date(d.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                              </div>
                                              <div className="text-[10px] font-bold text-slate-400 mt-1">
                                                  {new Date(d.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                              </div>
                                          </td>
                                          <td className="px-10 py-6">
                                              <div className="font-black text-[var(--text-primary)] tracking-tight">{d.User?.name}</div>
                                              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{d.User?.email}</div>
                                          </td>
                                          <td className="px-10 py-6 text-center">
                                              <div className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-wider bg-[var(--bg-primary)] py-2 px-4 rounded-lg inline-block border border-[var(--border-primary)]">
                                                  Mês {d.month}/{d.year}
                                              </div>
                                          </td>
                                          <td className="px-10 py-6 text-center">
                                              {d.content?.startsWith('Categorização OFX') ? (
                                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                      <Database size={10} /> Categorização OFX
                                                  </span>
                                              ) : d.content?.startsWith('Extração de Texto') ? (
                                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                      <MessageCircle size={10} /> Extração de Texto
                                                  </span>
                                              ) : (
                                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold rounded-full text-[9px] font-black uppercase tracking-widest">
                                                      <Activity size={10} /> Insight Mensal
                                                  </span>
                                              )}
                                          </td>
                                          <td className="px-10 py-6 text-right">
                                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                  <Check size={10} /> Sucesso
                                              </span>
                                          </td>
                                      </tr>
                                  ))}
                                  {filteredDetailed.length === 0 && (
                                      <tr>
                                          <td colSpan="5" className="px-10 py-24 text-center">
                                              <div className="flex flex-col items-center gap-4 opacity-30">
                                                  <Activity size={48} />
                                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhum registro encontrado</span>
                                              </div>
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      )}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </SystemLayout>
  );
};

const styles = `
  .dark .text-slate-400 { color: #94a3b8 !important; }
  .dark .text-slate-500 { color: #cbd5e1 !important; }
`;

export default () => (
  <>
    <style>{styles}</style>
    <AdminAIConfig />
  </>
);

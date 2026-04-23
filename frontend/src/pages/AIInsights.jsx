import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Database, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  ChevronRight,
  TrendingDown,
  Target,
  RefreshCw,
  History,
  Trash2,
  Calendar,
  ChevronLeft
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

// Componente leve para renderizar o Markdown da IA sem depender de bibliotecas externas
const MarkdownLite = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  
  return (
    <div className="ai-markdown space-y-4">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
        
        // Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={i} className="list-item">
              {line.substring(2).split('**').map((part, idx) => 
                idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
              )}
            </li>
          );
        }

        // Standard Paragraphs with bold support
        if (line.trim() === '') return <div key={i} className="h-2" />;
        
        return (
          <p key={i}>
            {line.split('**').map((part, idx) => 
              idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
};

const AIInsights = () => {
  const { success, error } = useNotification();
  const [currentInsight, setCurrentInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState({ insights: [], total: 0, pages: 1, currentPage: 1 });
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [insightToDelete, setInsightToDelete] = useState(null);

  const now = new Date();
  const [genMonth, setGenMonth] = useState(now.getMonth() + 1);
  const [genYear, setGenYear] = useState(now.getFullYear());

  const months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
  ];
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const fetchHistory = async (page = 1) => {
    try {
      setFetchingHistory(true);
      const response = await api.get('/ai-insights/history', { params: { page, limit: 5 } });
      setHistoryData(response.data);
    } catch (err) {
      error('Erro ao carregar histórico');
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ai-insights', { params: { month: genMonth, year: genYear } });
      setCurrentInsight(response.data);
      success('Novo insight gerado e salvo!');
      fetchHistory(1); // Refresh history to show the new one
    } catch (err) {
      error(err.response?.data?.error || 'Erro ao gerar insights com IA');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!insightToDelete) return;
    try {
      setLoading(true);
      await api.delete(`/ai-insights/${insightToDelete}`);
      success('Insight removido com sucesso');
      if (currentInsight?.id === insightToDelete) setCurrentInsight(null);
      fetchHistory(historyData.currentPage);
      setShowDeleteModal(false);
      setInsightToDelete(null);
    } catch (err) {
      error('Erro ao excluir insight');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setInsightToDelete(id);
    setShowDeleteModal(true);
  };

  return (
    <SystemLayout>
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteModal(false)}
                className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[var(--bg-secondary)] w-full max-w-sm rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl overflow-hidden relative z-10"
              >
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={28} />
                  </div>
                  <h3 className="text-xl font-black text-[var(--text-primary)]">Excluir Insight?</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Esta ação não pode ser desfeita. O relatório será removido permanentemente do seu histórico.
                  </p>
                </div>
                <div className="p-8 bg-[var(--bg-primary)]/50 border-t border-[var(--border-primary)] flex gap-4">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[var(--text-primary)] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    {loading ? 'Excluindo...' : 'Confirmar'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-[var(--bg-secondary)] p-10 rounded-[3rem] border border-[var(--border-primary)] shadow-sm">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-gold rounded-[2rem] text-navy-900 shadow-xl shadow-gold/20">
                <Zap size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black font-heading tracking-tight text-[var(--text-primary)]">Inteligência Financeira</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Análise Estratégica Personalizada</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="flex bg-[var(--bg-primary)] p-1 rounded-2xl border border-[var(--border-primary)] shadow-inner">
                <select 
                    value={genMonth}
                    onChange={(e) => setGenMonth(parseInt(e.target.value))}
                    className="bg-transparent border-none text-[10px] font-black uppercase py-2 px-4 focus:ring-0 cursor-pointer outline-none text-[var(--text-primary)]"
                >
                    {months.map(m => <option key={m.value} value={m.value} className="bg-[var(--bg-secondary)]">{m.label}</option>)}
                </select>
                <div className="w-px h-4 bg-[var(--border-primary)] self-center" />
                <select 
                    value={genYear}
                    onChange={(e) => setGenYear(parseInt(e.target.value))}
                    className="bg-transparent border-none text-[10px] font-black uppercase py-2 px-4 focus:ring-0 cursor-pointer outline-none text-[var(--text-primary)]"
                >
                    {years.map(y => <option key={y} value={y} className="bg-[var(--bg-secondary)]">{y}</option>)}
                </select>
             </div>

             <button
                onClick={generateInsights}
                disabled={loading}
                className="px-10 py-5 bg-navy-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gold transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3 disabled:opacity-50"
             >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Analisando...' : 'Gerar Insight'}
             </button>
          </div>
        </div>

        {/* Main Insight Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {currentInsight ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-primary)] shadow-sm overflow-hidden"
                  >
                    <div className="p-8 md:p-12 prose dark:prose-invert max-w-none">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--border-primary)]">
                           <div className="flex items-center gap-3 text-gold">
                              <Calendar size={18} />
                              <span className="font-black text-sm uppercase">{months.find(m => m.value === currentInsight.month).label} / {currentInsight.year}</span>
                           </div>
                           <button onClick={() => openDeleteModal(currentInsight.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                           </button>
                        </div>
                        <MarkdownLite content={currentInsight.content} />
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-[var(--bg-secondary)] rounded-[3rem] border border-dashed border-[var(--border-primary)] p-24 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                      <Database size={48} />
                    </div>
                    <div className="max-w-xs">
                      <h3 className="text-xl font-black text-[var(--text-primary)]">Pronto para Analisar</h3>
                      <p className="text-sm text-slate-400 font-medium mt-2">Escolha o período e clique em gerar para receber sua consultoria automática.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
           </div>

           {/* Sidebar: History */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-navy-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-navy-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <History size={80} />
                </div>
                <h4 className="font-black text-sm uppercase mb-6 flex items-center gap-2">
                    <History size={18} className="text-gold" /> Histórico
                </h4>
                
                <div className="space-y-3">
                   {fetchingHistory ? (
                     [1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)
                   ) : historyData.insights.length > 0 ? (
                     historyData.insights.map(item => (
                       <div 
                         key={item.id} 
                         onClick={() => setCurrentInsight(item)}
                         className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${
                            currentInsight?.id === item.id 
                                ? 'bg-gold border-gold text-navy-900 shadow-lg shadow-gold/20' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                         }`}
                       >
                         <div>
                            <div className="text-[10px] font-black uppercase leading-none">Insight de</div>
                            <div className="text-sm font-black mt-1">{months.find(m => m.value === item.month).label} {item.year}</div>
                         </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={16} />
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-10 text-white/40 text-[10px] font-black uppercase">Nenhum registro</div>
                   )}
                </div>

                {/* Pagination */}
                {historyData.pages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-white/10">
                    <button 
                      disabled={historyData.currentPage === 1}
                      onClick={() => fetchHistory(historyData.currentPage - 1)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[10px] font-black">{historyData.currentPage} / {historyData.pages}</span>
                    <button 
                      disabled={historyData.currentPage === historyData.pages}
                      onClick={() => fetchHistory(historyData.currentPage + 1)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gold/10 border border-gold/20 rounded-[2.5rem] p-8">
                 <div className="flex items-center gap-3 text-gold mb-4">
                    <Lightbulb size={24} />
                    <h5 className="font-black text-[10px] uppercase tracking-widest">Dica Premium</h5>
                 </div>
                 <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                    Gere um novo insight após fechar o mês para ter uma visão consolidada do seu desempenho financeiro.
                 </p>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .ai-markdown h1 { font-weight: 900; font-size: 1.5rem; margin-bottom: 1.5rem; text-transform: uppercase; color: var(--text-primary); }
        .ai-markdown h2 { font-weight: 800; font-size: 1.25rem; margin-top: 2rem; margin-bottom: 1rem; color: #EAB308; }
        .ai-markdown h3 { font-weight: 800; font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: var(--text-primary); }
        .ai-markdown p { font-size: 0.875rem; line-height: 1.625; color: var(--text-secondary); margin-bottom: 1rem; font-weight: 500; }
        .ai-markdown .list-item { position: relative; padding-left: 1.5rem; font-size: 0.875rem; line-height: 1.625; color: var(--text-secondary); margin-bottom: 0.75rem; font-weight: 500; list-style: none; }
        .ai-markdown .list-item::before { content: ''; position: absolute; left: 0; top: 0.5rem; width: 0.5rem; height: 0.5rem; background: #EAB308; border-radius: 99px; }
        .ai-markdown strong { font-weight: 900; color: var(--text-primary); }
        
        /* Ajustes finos para modo escuro */
        .dark .ai-markdown p, .dark .ai-markdown .list-item { color: #cbd5e1; }
        .dark .ai-markdown strong { color: #f8fafc; }
        .dark .text-slate-400 { color: #94a3b8; }
        .dark .text-slate-500 { color: #cbd5e1; }
      `}</style>
    </SystemLayout>
  );
};

export default AIInsights;

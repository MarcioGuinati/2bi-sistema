import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  User, 
  Clock, 
  Globe, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Info,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [expandedLog, setExpandedLog] = useState(null);
  
  // Filters
  const [actionFilter, setActionFilter] = useState('');
  
  const { error: notifyError } = useNotification();

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (actionFilter) params.action = actionFilter;

      const response = await api.get('/admin/audit-logs', { params });
      setLogs(response.data.rows);
      setTotalPages(response.data.pages);
      setTotalLogs(response.data.total);
    } catch (err) {
      notifyError('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const base = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ";
    if (!action) return base + "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    
    const act = action.toUpperCase();
    if (act.includes('SUCCESS') || act.includes('CREATE')) 
      return base + "bg-green-500/10 text-green-500 border border-green-500/20";
    if (act.includes('FAILED') || act.includes('DELETE')) 
      return base + "bg-red-500/10 text-red-500 border border-red-500/20";
    if (act.includes('REQUIRED') || act.includes('UPDATE')) 
      return base + "bg-gold/10 text-gold border border-gold/20";
    return base + "bg-slate-500/10 text-slate-500 border border-slate-500/20";
  };

  return (
    <SystemLayout title="Auditoria do Sistema">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black font-heading tracking-tight italic text-[var(--text-primary)]">Logs de Auditoria</h1>
            <p className="text-[var(--text-secondary)] font-bold text-sm">Monitoramento em tempo real de acessos e modificações estruturais.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-[var(--bg-secondary)] px-6 py-4 rounded-3xl border border-[var(--border-primary)] shadow-sm">
                <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest mb-1">Total de Registros</p>
                <p className="text-2xl font-black text-[var(--text-primary)] italic">{totalLogs.toLocaleString()}</p>
             </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-premium p-6 flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
            <input 
              type="text"
              placeholder="Filtrar por ação (ex: LOGIN)..."
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value.toUpperCase());
                setPage(1);
              }}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-gold text-sm font-bold text-[var(--text-primary)] transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-2xl border border-gold/20">
            <Activity size={16} className="text-gold" />
            <span className="text-[10px] font-black uppercase text-gold tracking-widest">Live Feed</span>
          </div>
        </div>

        {/* Logs Table */}
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Data e Hora</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Usuário</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Ação</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Módulo</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Endereço IP</th>
                  <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-10 text-center text-xs font-bold text-[var(--text-secondary)]">
                        Carregando registros...
                      </td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-sm font-bold text-[var(--text-secondary)] italic">
                      Nenhum registro encontrado para estes filtros.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr className={`hover:bg-[var(--bg-primary)]/40 transition-all cursor-pointer ${expandedLog === log.id ? 'bg-[var(--bg-primary)]/60' : ''}`} onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <Clock size={14} className="text-gold" />
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {format(new Date(log.createdAt), "dd MMM, HH:mm:ss", { locale: ptBR })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-black text-[10px]">
                              {log.user ? log.user.name.charAt(0) : '?'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-[var(--text-primary)]">{log.user ? log.user.name : 'Visitante'}</span>
                              <span className="text-[10px] font-bold text-[var(--text-secondary)]">{log.user ? log.user.email : 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={getActionBadge(log.action)}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{log.resource}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)]">
                            <Globe size={12} className="text-gold" />
                            {log.ipAddress || '0.0.0.0'}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button className={`p-2 rounded-xl transition-all ${expandedLog === log.id ? 'bg-gold text-navy-900 rotate-180' : 'bg-[var(--bg-primary)] text-gold hover:bg-gold hover:text-white'}`}>
                            <ChevronDown size={14} />
                          </button>
                        </td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr className="bg-[var(--bg-primary)]/30">
                          <td colSpan="6" className="px-10 py-6">
                            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[2rem] p-8 shadow-inner animate-in slide-in-from-top-2 duration-300">
                               <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-primary)] pb-4">
                                  <Info size={16} className="text-gold" />
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">Metadados do Registro</h4>
                               </div>
                               <pre className="text-xs font-mono font-bold text-[var(--text-primary)] bg-[var(--bg-primary)] p-6 rounded-2xl overflow-x-auto leading-loose whitespace-pre-wrap">
                                 {JSON.stringify(log.details, null, 2)}
                               </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]/20 flex justify-between items-center">
             <p className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest italic">
               Página {page} de {totalPages}
             </p>
             <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-gold disabled:opacity-30 hover:bg-gold hover:text-white transition-all shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-gold disabled:opacity-30 hover:bg-gold hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
};

export default AuditLogs;

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Clock,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import reportGenerator from '../services/reportGenerator';
import { format } from 'date-fns';

const Reports = () => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const { error: notifyError } = useNotification();

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (err) {
      notifyError('Erro ao carregar seus relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report) => {
    const fullData = {
      user: { name: authUser.name },
      summary: report.summary_data.summary,
      transactions: [],
      categories: report.summary_data.categories,
      goals: report.summary_data.goals,
      period: { start: report.period_start, end: report.period_end },
      consultant_note: report.consultant_note
    };
    await reportGenerator.generateStrategicReport(fullData);
  };

  return (
    <SystemLayout title="Meus Relatórios Estratégicos">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black font-heading tracking-tight italic text-[var(--text-primary)] uppercase">Central de Relatórios</h1>
            <p className="text-[var(--text-secondary)] font-bold text-sm">Visualize e baixe as análises oficiais publicadas pela sua consultoria.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="card-premium h-[400px] flex items-center justify-center">
                 <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
              </div>
            ) : reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((report) => (
                  <div key={report.id} className="card-premium p-8 group hover:border-gold transition-all animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="flex flex-col h-full space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-gold/10 rounded-2xl text-gold group-hover:scale-110 transition-transform">
                          <FileText size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full">
                          {format(new Date(report.createdAt), 'dd MMM yyyy')}
                        </span>
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <h3 className="text-lg font-black text-[var(--text-primary)] leading-tight uppercase italic">{report.title}</h3>
                        <p className="text-xs font-bold text-[var(--text-secondary)]">Análise referente ao período de {format(new Date(report.period_start), 'dd/MM/yy')} a {format(new Date(report.period_end), 'dd/MM/yy')}.</p>
                      </div>

                      <div className="pt-6 border-t border-[var(--border-primary)] flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gold" />
                            <span className="text-[10px] font-black uppercase text-gold tracking-widest">Publicado</span>
                         </div>
                         <button 
                           onClick={() => handleDownload(report)}
                           className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:text-gold transition-colors"
                         >
                            Baixar PDF <ArrowRight size={14} />
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-premium h-[400px] flex flex-col items-center justify-center text-center p-10 space-y-4">
                 <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center text-[var(--text-secondary)]">
                    <FileText size={32} />
                 </div>
                 <h3 className="text-xl font-black text-[var(--text-primary)] uppercase italic">Nenhum relatório publicado</h3>
                 <p className="text-sm font-bold text-[var(--text-secondary)] max-w-sm">Sua consultoria ainda não publicou relatórios oficiais. Assim que um novo relatório estiver disponível, você será notificado.</p>
              </div>
            )}
          </div>

          {/* Sidebar / Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-premium p-8 bg-gold shadow-2xl shadow-gold/20 text-white border-none">
              <div className="space-y-6">
                 <TrendingUp size={32} />
                 <h3 className="text-2xl font-black italic leading-tight uppercase">Por que acompanhar seus relatórios?</h3>
                 <p className="text-sm font-bold text-white/80 leading-relaxed">
                   Os relatórios estratégicos consolidam seu desempenho e fornecem o direcionamento necessário para suas próximas decisões financeiras.
                 </p>
                 <div className="space-y-4 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-3">
                       <ShieldAlert size={18} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Segurança Bancária</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Calendar size={18} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Análise de Ciclo</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="card-premium p-8 space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">Suporte Estratégico</h4>
               <p className="text-xs font-bold text-[var(--text-secondary)]">Dúvidas sobre sua análise? Entre em contato com seu consultor 2BI.</p>
               <button className="w-full py-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gold hover:text-white transition-all">
                  Abrir Chamado
               </button>
            </div>
          </div>
        </div>

      </div>
    </SystemLayout>
  );
};

export default Reports;

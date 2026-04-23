import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  MessageCircle, 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  ArrowUpRight,
  Filter,
  DollarSign,
  PieChart
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const AdminMentorship = () => {
  const { error } = useNotification();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, alerts, negative, overbudget
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/mentorship-overview', {
        params: { month: selectedMonth, year: selectedYear }
      });
      setData(response.data);
    } catch (err) {
      error('Erro ao carregar visão de mentoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const filteredData = data.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'alerts') return matchesSearch && (client.isNegative || client.overBudgetCount > 0);
    if (filterType === 'negative') return matchesSearch && client.isNegative;
    if (filterType === 'overbudget') return matchesSearch && client.overBudgetCount > 0;
    return matchesSearch;
  });

  const getWhatsAppLink = (client) => {
    const monthLabel = months.find(m => m.value === selectedMonth)?.label;
    const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();
    const periodStr = isCurrentMonth ? 'no mês' : `em ${monthLabel}/${selectedYear}`;

    let message = `Olá ${client.name.split(' ')[0]}, tudo bem? 2BI Planejamento aqui. `;
    if (client.isNegative) {
      message += `Notei que seu saldo ${periodStr} está negativo em R$ ${Math.abs(client.balanceMonth).toLocaleString('pt-BR')}. Vamos conversar para ajustar seu fluxo de caixa?`;
    } else if (client.overBudgetCount > 0) {
      message += `Vi que você ultrapassou o orçamento ${periodStr} em ${client.overBudgetCount} categorias. Podemos revisar seus orçamentos?`;
    } else {
      message += `Passando para acompanhar seus resultados financeiros ${periodStr}. Estão ótimos!`;
    }
    
    const phone = client.phone?.replace(/\D/g, '');
    return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <SystemLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase">
          <div>
            <h2 className="text-4xl font-black font-heading tracking-tight text-[var(--text-primary)]">Gestão de Mentoria</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Acompanhamento Consultivo de Clientes</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Month/Year Selectors */}
            <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-primary)] shadow-sm">
                <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="bg-transparent border-none text-[10px] font-black uppercase py-2 px-4 focus:ring-0 cursor-pointer outline-none text-[var(--text-primary)]"
                >
                    {months.map(m => <option key={m.value} value={m.value} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{m.label}</option>)}
                </select>
                <div className="w-px h-4 bg-[var(--border-primary)] self-center" />
                <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="bg-transparent border-none text-[10px] font-black uppercase py-2 px-4 focus:ring-0 cursor-pointer outline-none text-[var(--text-primary)]"
                >
                    {years.map(y => <option key={y} value={y} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">{y}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-4 bg-[var(--bg-secondary)] p-2 rounded-2xl border border-[var(--border-primary)] shadow-sm">
                <div className={`p-4 rounded-xl flex items-center gap-3 ${data.some(c => c.isNegative || c.overBudgetCount > 0) ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                <AlertTriangle size={20} />
                <div>
                    <div className="text-[10px] font-black uppercase leading-none">Alertas Ativos</div>
                    <div className="text-lg font-black leading-none mt-1">
                        {data.filter(c => c.isNegative || c.overBudgetCount > 0).length}
                    </div>
                </div>
                </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar cliente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-gold outline-none transition-all font-medium text-[var(--text-primary)] placeholder:text-slate-500"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'alerts', label: 'Com Alertas' },
              { id: 'negative', label: 'No Vermelho' },
              { id: 'overbudget', label: 'Fora do Orçamento' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterType === f.id 
                    ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' 
                    : 'bg-[var(--bg-secondary)] text-slate-400 border border-[var(--border-primary)] hover:border-gold'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-[var(--bg-secondary)] rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredData.map(client => (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-[var(--bg-secondary)] rounded-[2.5rem] border transition-all overflow-hidden relative group ${
                    client.isNegative || client.overBudgetCount > 0 
                      ? 'border-red-500/30 shadow-xl shadow-red-500/5' 
                      : 'border-[var(--border-primary)] shadow-sm'
                  }`}
                >
                  {/* Status Badges */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    {client.isNegative && (
                      <div className="bg-red-500 text-white p-2 rounded-xl shadow-lg animate-bounce">
                        <TrendingDown size={16} />
                      </div>
                    )}
                    {client.overBudgetCount > 0 && (
                      <div className="bg-amber-500 text-white p-2 rounded-xl shadow-lg">
                        <PieChart size={16} />
                      </div>
                    )}
                  </div>

                  <div className="p-8 pb-4">
                    <div className="w-12 h-12 bg-navy-900 rounded-2xl flex items-center justify-center text-gold font-black text-xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-navy-900/20">
                      {client.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] truncate">{client.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mt-1">
                       <Clock size={12} /> Atividade: {new Date(client.lastActive).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="px-8 py-6 bg-[var(--bg-primary)]/50 border-y border-[var(--border-primary)] flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-black uppercase text-slate-400">Saldo no Mês</div>
                      <div className={`font-black text-sm ${client.balanceMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        R$ {client.balanceMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-black uppercase text-slate-400">Orçamentos Estourados</div>
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black ${client.overBudgetCount > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                        {client.overBudgetCount} CATEGORIAS
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <a
                      href={getWhatsAppLink(client)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                        client.isNegative || client.overBudgetCount > 0
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                          : 'bg-navy-900 text-white hover:bg-gold shadow-navy-200'
                      }`}
                    >
                      <MessageCircle size={18} /> Chamar no WhatsApp
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredData.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold">
                Nenhum cliente encontrado com estes filtros.
              </div>
            )}
          </div>
        )}
      </div>
    </SystemLayout>
  );
};

export default AdminMentorship;

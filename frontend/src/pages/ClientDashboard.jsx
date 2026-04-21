import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Target,
  Calendar,
  Layers,
  TrendingUp,
  ChevronRight,
  X,
  CreditCard,
  Plus,
  Quote,
  ChevronLeft
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { success, error } = useNotification();
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [dashboardData, setDashboardData] = useState({ monthlyData: [], categoryData: [] });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'dashboard' ? 'dashboard' : 'overview');
  
  // Date Filtering State
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const getDateRange = (month, year) => {
    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
    return { start, end };
  };

  // Modals
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', category_id: '', deadline: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange(selectedMonth, selectedYear);
      const [statsRes, transRes, catsRes, goalsRes, dashRes] = await Promise.all([
        api.get(`/transactions/stats?startDate=${start}&endDate=${end}`),
        api.get('/transactions?limit=5'),
        api.get('/categories'),
        api.get('/goals'),
        api.get(`/transactions/dashboard-stats?startDate=${start}&endDate=${end}`)
      ]);
      setStats(statsRes.data);
      setTransactions(transRes.data.rows);
      setCategories(catsRes.data);
      setGoals(goalsRes.data);
      setDashboardData(dashRes.data);
    } catch (err) {
      console.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    setActiveTab(tab === 'dashboard' ? 'dashboard' : 'overview');
  }, [searchParams]);

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', goalForm);
      setShowGoalModal(false);
      setGoalForm({ title: '', targetAmount: '', category_id: '', deadline: '' });
      success('Novo limite orçamentário definido!');
      fetchData();
    } catch (err) { error('Falha ao registrar orçamento'); }
  };

  // Motivational Quotes
  const quotes = [
    { text: "O sucesso financeiro não é sobre quanto você ganha, mas sobre quanto você mantém.", author: "Estratégia 2BI" },
    { text: "A disciplina é a ponte entre seus objetivos e suas conquistas financeiras.", author: "Mentalidade Próspera" },
    { text: "Seu patrimônio é o reflexo das suas escolhas de hoje. Planeje com inteligência.", author: "2BI Planejamento" },
    { text: "Invista em você e no seu futuro. Pequenos passos geram grandes destinos.", author: "Foco no Longo Prazo" }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const data = [
    { name: 'Receitas', value: stats.income, color: '#00F5A0' },
    { name: 'Despesas', value: stats.expense, color: '#FF4D4D' },
  ];

  return (
    <SystemLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Bem-vindo, {user?.name.split(' ')[0]}!</h1>
            <p className="text-[var(--text-secondary)] font-medium tracking-tight">Visão estratégica e orçamentária do seu patrimônio.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Period Selector */}
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-1.5 rounded-2xl shadow-sm mr-2">
              <div className="flex items-center gap-2 pl-3 text-gold">
                <Calendar size={16} />
              </div>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-transparent border-none outline-none text-xs font-bold text-[var(--text-primary)] cursor-pointer pr-4"
              >
                {months.map((m, i) => <option key={m} value={i} className="bg-[var(--bg-secondary)]">{m}</option>)}
              </select>
              <div className="w-px h-4 bg-[var(--border-primary)]" />
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent border-none outline-none text-xs font-bold text-[var(--text-primary)] cursor-pointer"
              >
                {years.map(y => <option key={y} value={y} className="bg-[var(--bg-secondary)]">{y}</option>)}
              </select>
            </div>

            <button
              onClick={() => setShowGoalModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Target size={20} /> Definir Orçamento
            </button>
            <a
              href="/finance"
              className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-6 py-3 rounded-2xl font-bold text-[var(--text-primary)] shadow-sm hover:bg-[var(--bg-primary)] flex items-center gap-2 transition-all font-medium text-sm"
            >
              <Plus size={18} /> Novo Lançamento
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-[var(--border-primary)] pb-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`text-xs font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-slate-400 hover:bg-[var(--bg-primary)]'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`text-xs font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-slate-400 hover:bg-[var(--bg-primary)]'}`}
          >
            Dashboard Estratégico
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Motivational Banner */}
            <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 md:p-12 shadow-2xl group transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-navy-900 border-white/5 text-white shadow-navy-900/20' 
                : 'bg-white border-slate-100 text-navy-900 shadow-gold/5'
            }`}>
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/10 dark:from-gold/20 to-transparent pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 opacity-5 dark:opacity-10">
                <Quote size={200} className="text-gold" />
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuote}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="relative z-10 flex flex-col md:flex-row items-center gap-8"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gold/10 dark:bg-gold/20 rounded-3xl flex items-center justify-center border border-gold/20 flex-shrink-0">
                    <TrendingUp size={40} className="text-gold" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl md:text-3xl font-black italic mb-3 leading-tight tracking-tight">
                      "{quotes[currentQuote].text}"
                    </h2>
                    <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em] font-bold">
                      {quotes[currentQuote].author}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Indicators */}
              <div className="flex gap-2 mt-8 justify-center md:justify-start relative z-10">
                {quotes.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-1000 ${i === currentQuote ? 'w-8 bg-gold' : 'w-2 bg-slate-300 dark:bg-white/20'}`} 
                  />
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <motion.div
            whileHover={{ y: -5 }}
            className="card-premium p-8 flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center shadow-inner">
              <ArrowUpRight size={32} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Entradas do Mês</p>
              <h3 className="text-2xl font-black text-[var(--text-primary)]">R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center shadow-inner">
              <ArrowDownLeft size={32} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Saídas Consolidadas</p>
              <h3 className="text-2xl font-black text-red-600">R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[var(--bg-secondary)] p-8 rounded-[2rem] shadow-xl shadow-gold/5 border border-gold/10 flex items-center gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 font-medium">
              <TrendingUp size={80} className="text-gold" />
            </div>
            <div className="w-16 h-16 bg-gold/10 text-gold rounded-3xl flex items-center justify-center border border-gold/20">
              <Wallet size={32} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-black text-gold tracking-widest mb-1">Saldo Atual</p>
              <h3 className="text-2xl font-black text-[var(--text-primary)] italic">R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 card-premium p-8">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold font-heading">Saúde Financeira</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Receitas
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Despesas
                </div>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goals / Budgets */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 rounded-[2.5rem] text-[var(--text-primary)] shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-xl font-bold font-heading">Orçamentário</h3>
                <TrendingUp className="text-gold" size={24} />
              </div>
              <div className="space-y-8">
                {goals.length > 0 ? goals.map(goal => {
                  const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                  const isExceeded = percentage > 100;

                  return (
                    <div key={goal.id} className="space-y-3">
                      <div className="flex justify-between items-end text-xs font-bold">
                        <div className="flex flex-col">
                          <span className="text-gold uppercase tracking-widest">{goal.title}</span>
                          <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-tighter">
                            {goal.Category?.name ? `Cat: ${goal.Category.name}` : 'Meta Geral'}
                          </span>
                        </div>
                        <span className={`${isExceeded ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>{percentage}%</span>
                      </div>
                      <div className="h-3 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-primary)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          className={`h-full shadow-lg ${isExceeded ? 'bg-red-500 shadow-red-500/20' : 'bg-gradient-to-r from-gold to-yellow-500 shadow-gold/20'}`}
                        />
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-bold flex justify-between">
                        <span>Gasto: R$ {Number(goal.currentAmount).toLocaleString()}</span>
                        <span>Limite: R$ {Number(goal.targetAmount).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-10 text-[var(--text-secondary)] italic text-sm">Nenhum orçamento definido.</div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="w-full mt-8 py-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-all shadow-sm"
            >
              Configurar Novo Limite
            </button>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="card-premium overflow-hidden">
          <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center">
            <h3 className="text-xl font-bold font-heading">Lançamentos Recentes</h3>
            <a href="/finance" className="text-xs font-black text-gold uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
              Acessar Gestão Completa <ChevronRight size={14} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-primary)] text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Descrição</th>
                  <th className="px-8 py-5">Categoria</th>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--bg-primary)]/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold">{t.description}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-widest italic">{t.Account?.name || 'Geral'}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)]">
                        {t.Category?.name || 'Sem categoria'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-[var(--text-secondary)] font-medium">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`px-8 py-5 text-right font-black text-sm ${t.type === 'income' ? 'text-green-600' : 'text-[var(--text-primary)]'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Row 1: Provisionamento Anual */}
            <div className="card-premium p-8">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-bold font-heading">Provisionamento Anual</h3>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Fluxo projetado de Receitas vs Despesas</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" /> Receitas
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Despesas
                  </div>
                </div>
              </div>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.monthlyData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F87171" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(val) => `R$ ${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="receita" stroke="#4ADE80" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="despesa" stroke="#F87171" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart: Distribution */}
              <div className="card-premium p-8">
                <h3 className="text-xl font-bold font-heading mb-6">Distribuição por Categoria</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dashboardData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#1e293b', '#EAB308', '#dc2626', '#16a34a', '#2563eb'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} content={({ payload }) => (
                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                          {payload.map((entry, index) => (
                            <div key={`item-${index}`} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-[10px] font-black uppercase text-slate-500">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      )} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance / Balanced Chart */}
              <div className="card-premium p-8">
                <h3 className="text-xl font-bold font-heading mb-2">Evolução de Saldo</h3>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-10">Acumulado mensal do patrimônio</p>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                      <Tooltip 
                         cursor={{ fill: 'transparent' }}
                         contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="saldo" radius={[8, 8, 0, 0]}>
                        {dashboardData.monthlyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.saldo >= 0 ? '#4ADE80' : '#F87171'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Visual Quote / Placeholder for better design */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-12 rounded-[3rem] text-center relative overflow-hidden shadow-sm">
               <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               <TrendingUp className="text-gold mx-auto mb-6" size={48} />
               <h4 className="text-2xl font-black text-[var(--text-primary)] italic max-w-2xl mx-auto leading-tight">
                 "O planejamento financeiro estratégico é a bússola que transforma objetivos em realidades tangíveis."
               </h4>
               <p className="text-gold text-xs font-black uppercase tracking-[0.3em] mt-6 font-bold">Inteligência Financeira 2BI</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Budget Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[1.5rem] md:rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
               <div className="bg-navy-900 p-8 text-white flex justify-between items-center text-center">
                 <div>
                   <h3 className="text-2xl font-black font-heading">Definir Orçamento</h3>
                   <p className="text-gold text-xs font-black uppercase tracking-widest font-medium">Fronteira Financeira 2BI</p>
                 </div>
                 <button onClick={() => setShowGoalModal(false)}><X size={20} /></button>
               </div>
               <form onSubmit={handleGoalSubmit} className="p-8 space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-black text-slate-400">Título do Orçamento</label>
                   <input
                     type="text"
                     required
                     value={goalForm.title}
                     onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
                     className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold"
                     placeholder="Ex: Gasto com Alimentação"
                   />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase font-black text-slate-400">Limite Mensal (R$)</label>
                     <input
                       type="number"
                       required
                       value={goalForm.targetAmount}
                       onChange={e => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                       className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-black"
                       placeholder="0.00"
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase font-black text-slate-400">Vincular Categoria</label>
                     <select
                       required
                       value={goalForm.category_id}
                       onChange={e => setGoalForm({ ...goalForm, category_id: e.target.value })}
                       className="select-premium"
                     >
                       <option value="">Selecione...</option>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                     </select>
                   </div>
                 </div>
                <p className="text-[10px] text-slate-400 italic">O sistema calculará automaticamente seus gastos nesta categoria do dia 1º até hoje.</p>
                <button type="submit" className="w-full btn-primary py-5 font-black text-lg shadow-gold/30 mt-4">Ativar Orçamento</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SystemLayout>
  );
};

export default ClientDashboard;

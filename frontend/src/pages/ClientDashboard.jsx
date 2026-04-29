import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
  ChevronDown,
  X,
  CreditCard,
  Plus,
  Quote,
  ChevronLeft,
  FileText,
  Info
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
import AnnouncementPanel from '../components/AnnouncementPanel';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { success, error } = useNotification();
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [dashboardData, setDashboardData] = useState({ monthlyData: [], categoryData: [] });
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [previewUrl, setPreviewUrl] = useState(null);

  // Date Filtering State
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = [2026, 2027, 2028, 2029, 2030];

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

      // Fetch Billing
      const [contractsRes, paymentsRes] = await Promise.all([
        api.get(`/contracts/${user.id}`),
        api.get(`/payments/${user.id}`)
      ]);
      setContracts(contractsRes.data);
      setPayments(paymentsRes.data);
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
    const client = user;
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
      console.error('Erro ao carregar logo para o PDF:', err);
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

    // Summary of Fees
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
    doc.text('CNPJ: 57.967.874/0001-30', 50, y + 5);

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

    if (hasSetup) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, y - 5, (pageWidth - 40) / (hasMonthly ? 2.1 : 1), 25, 3, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Valor Projeto:', 30, y + 5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(197, 160, 89);
      doc.text(`R$ ${Number(contract.setupValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 30, y + 13);
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('* Valor Projeto Isento', 20, y + 5);
    }

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
      doc.save(`Contrato_2BI_${contract.title.replace(/\s+/g, '_')}.pdf`);
      success('Contrato baixado com sucesso!');
    } catch (err) {
      console.error('Erro ao baixar contrato:', err);
      error('Ocorreu um erro ao gerar o PDF do contrato.');
    }
  };

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

        <AnnouncementPanel />

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-[var(--border-primary)] pb-4 overflow-x-auto scrollbar-hide flex-nowrap -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-[10px] md:text-xs font-black uppercase tracking-widest px-4 md:px-6 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-slate-400 hover:bg-[var(--bg-primary)]'}`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`text-[10px] md:text-xs font-black uppercase tracking-widest px-4 md:px-6 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-slate-400 hover:bg-[var(--bg-primary)]'}`}
          >
            Dashboard Estratégico
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`text-[10px] md:text-xs font-black uppercase tracking-widest px-4 md:px-6 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'billing' ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-slate-400 hover:bg-[var(--bg-primary)]'}`}
          >
            Meu Plano & Faturamento
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Frase do Dia - Discrete & Elegant */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20">
                  <TrendingUp size={20} className="text-gold" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[var(--text-primary)] italic tracking-tight">Visão Geral</h2>
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Acompanhe seu desempenho hoje</p>
                </div>
              </div>

              <div className="group relative">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl transition-all shadow-sm">
                  <Quote size={12} className="text-gold" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)]">Frase do Dia</span>
                  <ChevronDown size={10} className="text-slate-400" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-72 p-5 bg-navy-900 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[100] shadow-2xl border border-white/10 pointer-events-none">
                  <Quote size={24} className="text-gold/20 mb-2" />
                  <p className="text-[11px] italic leading-relaxed font-medium">"{quotes[currentQuote].text}"</p>
                  <p className="text-[9px] text-gold font-black uppercase mt-3 tracking-widest">— {quotes[currentQuote].author}</p>
                </div>
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
                className="card-premium p-8 flex items-center gap-6"
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

            {/* Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-[2rem] shadow-sm relative group">
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                  <TrendingUp size={40} className="absolute -bottom-2 -right-2 text-gold/5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex justify-between items-start mb-1 relative z-10">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Savings Rate</p>
                  <div className="group/tip relative">
                    <Info size={10} className="text-gold cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
                      Cálculo: (Renda - Gastos) / Renda. Reflete a sua eficiência em converter ganhos em patrimônio.
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-2 relative z-10">
                  <h4 className="text-2xl font-black text-gold">
                    {stats.income > 0 ? Math.max(0, Math.round(((stats.income - stats.expense) / stats.income) * 100)) : 0}%
                  </h4>
                  <span className="text-[10px] font-black text-slate-400 mb-1.5 uppercase">da renda</span>
                </div>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-[2rem] shadow-sm relative group">
                <div className="flex justify-between items-start mb-1 relative z-10">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Status Receita</p>
                  <div className="group/tip relative">
                    <Info size={10} className="text-gold cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
                      Mostra o crescimento ou queda da sua renda total comparada ao mês anterior.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <h4 className={`text-2xl font-black ${dashboardData.comparison?.income?.percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dashboardData.comparison?.income?.percent ? dashboardData.comparison.income.percent.toFixed(1) : '0.0'}%
                  </h4>
                  {dashboardData.comparison?.income?.percent >= 0 ? (
                    <ArrowUpRight size={18} className="text-green-500" />
                  ) : (
                    <ArrowDownLeft size={18} className="text-red-500" />
                  )}
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 relative z-10">vs mês anterior</p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-[2rem] shadow-sm relative group">
                <div className="flex justify-between items-start mb-1 relative z-10">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Controle de Saídas</p>
                  <div className="group/tip relative">
                    <Info size={10} className="text-gold cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
                      Representa a variação dos seus gastos. Porcentagem verde indica economia; vermelha indica aumento.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <h4 className={`text-2xl font-black ${dashboardData.comparison?.expense?.percent <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(dashboardData.comparison?.expense?.percent || 0).toFixed(1)}%
                  </h4>
                  {dashboardData.comparison?.expense?.percent <= 0 ? (
                    <ArrowDownLeft size={18} className="text-green-500" />
                  ) : (
                    <ArrowUpRight size={18} className="text-red-500" />
                  )}
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 relative z-10">
                  {dashboardData.comparison?.expense?.percent <= 0 ? 'Economia' : 'Aumento'} de gastos
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 rounded-[2rem] shadow-sm relative group">
                <div className="flex justify-between items-start mb-1 relative z-10">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Liberdade Financeira</p>
                  <div className="group/tip relative">
                    <Info size={10} className="text-gold cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
                      Calcula quanto do seu custo de vida atual está sendo coberto pelas sobras financeiras deste mês.
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-2 relative z-10">
                  <h4 className="text-2xl font-black text-[var(--text-primary)]">
                    {Math.min(100, Math.round((stats.balance / (stats.expense || 1)) * 100))}%
                  </h4>
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 relative z-10">Cobertura Mensal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart */}
              <div className="lg:col-span-2 card-premium p-8 relative">
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-heading">Saúde Financeira</h3>
                    <div className="group/tip relative">
                      <Info size={12} className="text-gold cursor-help opacity-50" />
                      <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10">
                        Comparativo direto entre tudo o que entrou e tudo o que saiu da sua conta no período selecionado.
                      </div>
                    </div>
                  </div>
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
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-[var(--text-primary)] shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold font-heading">Orçamentário</h3>
                      <div className="group/tip relative">
                        <Info size={12} className="text-navy-900 dark:text-gold cursor-help opacity-50" />
                        <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-navy-900 text-[10px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10 text-left">
                          Calculado com base nos limites que você definiu para cada categoria. Mostra o consumo do seu orçamento em tempo real.
                        </div>
                      </div>
                    </div>
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
        ) : activeTab === 'billing' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contract Overview */}
              <div className="lg:col-span-1 space-y-6">
                {contracts.length > 0 ? contracts.map(c => (
                  <div key={c.id} className="bg-navy-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-white/10 shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10 space-y-6">
                      <div>
                        <span className="text-[8px] font-black text-gold uppercase tracking-[0.3em] px-3 py-1 bg-gold/10 rounded-full border border-gold/20">Seu Plano Ativo</span>
                        <h3 className="text-2xl font-black italic mt-3 tracking-tighter text-white">{c.title}</h3>
                      </div>

                      <div className="space-y-4">
                        {Number(c.setupValue) > 0 && (
                          <div className="flex justify-between items-end border-b border-white/5 pb-3">
                            <span className="text-[10px] uppercase font-black text-white/40">Valor Projeto</span>
                            <span className="text-lg font-black text-gold">R$ {Number(c.setupValue).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-end border-b border-white/5 pb-3">
                          <span className="text-[10px] uppercase font-black text-white/40">Mensalidade</span>
                          <span className="text-xl font-black text-white italic">R$ {Number(c.monthlyValue).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] uppercase font-black text-white/40">Vínculo desde</span>
                          <span className="text-xs font-bold text-white/60">{new Date(c.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadContract(c)}
                        className="w-full py-4 bg-gold text-navy-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gold/20"
                      >
                        <CreditCard size={16} /> Baixar Contrato PDF
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-12 rounded-[2.5rem] text-center">
                    <CreditCard className="text-slate-200 mx-auto mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhum contrato ativo identificado.</p>
                  </div>
                )}

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 rounded-[2.5rem] shadow-sm">
                  <h4 className="text-xs font-black uppercase text-gold tracking-widest mb-4">Informação de Apoio</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    Suas mensalidades são geradas automaticamente. Caso tenha dúvidas sobre cobranças ou precise alterar dados de faturamento, entre em contato via WhatsApp com nossa equipe.
                  </p>
                </div>
              </div>

              {/* Payment History */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card-premium overflow-hidden border border-[var(--border-primary)]">
                  <div className="p-6 md:p-8 border-b border-[var(--border-primary)]">
                    <h3 className="text-lg md:text-xl font-bold font-heading">Histórico de Parcelas</h3>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[600px]">
                      <thead>
                        <tr className="bg-[var(--bg-primary)] text-[10px] font-black uppercase text-slate-400">
                          <th className="px-8 py-6">Vencimento</th>
                          <th className="px-8 py-6">Descrição</th>
                          <th className="px-8 py-6">Valor</th>
                          <th className="px-8 py-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-primary)]">
                        {payments.map(p => (
                          <tr key={p.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                            <td className="px-6 md:px-8 py-4 md:py-6 text-xs font-black">{new Date(p.dueDate).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 md:px-8 py-4 md:py-6">
                              <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight">{p.description}</div>
                            </td>
                            <td className="px-6 md:px-8 py-4 md:py-6 text-sm font-black italic whitespace-nowrap">R$ {Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                              <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full border shadow-sm ${p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                {p.status === 'paid' ? 'Liquidado' : 'Aguardando'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Row 1: Evolução Patrimonial (New WOW factor) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 card-premium p-6 md:p-8 relative">
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp size={120} className="text-gold" />
                  </div>
                </div>
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <div className="flex items-center gap-2">
                    <div>
                      <h3 className="text-xl font-bold font-heading italic">Evolução Patrimonial</h3>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Crescimento Líquido Acumulado</p>
                    </div>
                    <div className="group/tip relative">
                      <Info size={12} className="text-gold cursor-help opacity-50" />
                      <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-navy-900 text-[11px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10 normal-case font-medium">
                        Cálculo Acumulado: Saldo Anterior + (Receitas - Despesas do mês). Mostra a variação real do seu patrimônio ao longo do ano.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full">
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest">Ano {selectedYear}</span>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.monthlyData}>
                      <defs>
                        <linearGradient id="colorPatrimony" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c5a059" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 'bold' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        tickFormatter={(val) => `R$ ${val.toLocaleString()}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '24px',
                          border: '1px solid rgba(197, 160, 89, 0.2)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                          background: theme === 'dark' ? '#0b1b33' : '#ffffff',
                          padding: '20px'
                        }}
                        itemStyle={{ color: '#c5a059', fontWeight: 'bold' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="saldoAcumulado"
                        stroke="#c5a059"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorPatrimony)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card-premium p-6 md:p-8 border-gold/20 shadow-sm relative group overflow-hidden">
                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-black italic tracking-tighter text-[var(--text-primary)]">Insights do Mês</h3>
                      <div className="p-2 bg-gold/10 rounded-xl border border-gold/20">
                        <TrendingUp size={20} className="text-gold" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] shadow-inner">
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Capacidade de Poupança</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-gold">
                            {stats.income > 0 ? ((stats.income - stats.expense) / stats.income * 100).toFixed(1) : 0}%
                          </span>
                          <span className="text-xs font-bold text-slate-400">da renda total</span>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] shadow-inner">
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Fluxo de Caixa</p>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-black ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            R$ {stats.balance.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-400">saldo disponível</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[var(--border-primary)] transition-colors">
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                      "Seu crescimento acumulado reflete a disciplina estratégica aplicada neste trimestre."
                    </p>
                    <p className="text-[9px] font-black uppercase text-gold mt-2 tracking-widest">— Parecer 2BI</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Provisionamento Anual (Standard chart but moved) */}
            <div className="card-premium p-8 relative">
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="text-xl font-bold font-heading">Provisionamento Anual</h3>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Fluxo projetado de Receitas vs Despesas</p>
                  </div>
                  <div className="group/tip relative">
                    <Info size={12} className="text-gold cursor-help opacity-50" />
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-navy-900 text-[11px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10 normal-case font-medium">
                      Exibe a tendência mensal de entradas e saídas, permitindo visualizar sazonalidades nos seus ganhos e gastos.
                    </div>
                  </div>
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
                        <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F87171" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
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
              <div className="card-premium p-8 flex flex-col">
                <h3 className="text-xl font-bold font-heading mb-6">Distribuição por Categoria</h3>
                <div className="h-[420px] w-full">
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
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        content={({ payload }) => (
                          <div className="max-h-28 overflow-y-auto custom-scrollbar mt-6 pr-2">
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                              {payload.map((entry, index) => (
                                <div key={`item-${index}`} className="flex items-center gap-2 min-w-[100px]">
                                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                  <span className="text-[9px] font-black uppercase text-slate-500 truncate" title={entry.value}>{entry.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance / Balanced Chart */}
              <div className="card-premium p-6 md:p-8">
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

            {/* Comparativo de Fluxo Anual */}
            <div className="card-premium p-8">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-bold font-heading">Comparativo de Fluxo Anual</h3>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Receitas vs Despesas (Mensal)</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Receitas
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Despesas
                  </div>
                </div>
              </div>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.monthlyData} barGap={10}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} tickFormatter={(val) => `R$ ${val}`} />
                    <Tooltip
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Bar dataKey="receita" name="Receita" fill="#4ADE80" radius={[6, 6, 0, 0]} barSize={25} />
                    <Bar dataKey="despesa" name="Despesa" fill="#F87171" radius={[6, 6, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Visual Quote / Placeholder for better design */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 md:p-12 rounded-[2.25rem] md:rounded-[3rem] text-center relative overflow-hidden shadow-sm">
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

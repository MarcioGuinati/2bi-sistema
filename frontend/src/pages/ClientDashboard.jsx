import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { maskCurrency, sanitizeValue } from '../utils/masks';

// Sub-components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsGrid from '../components/dashboard/StatsGrid';
import PerformanceIndicators from '../components/dashboard/PerformanceIndicators';
import MainCharts from '../components/dashboard/MainCharts';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BillingSection from '../components/dashboard/BillingSection';
import StrategicDashboard from '../components/dashboard/StrategicDashboard';
import GoalModal from '../components/dashboard/GoalModal';
import DailyQuote from '../components/dashboard/DailyQuote';

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

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = useMemo(() => [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ], []);

  const years = useMemo(() => [2026, 2027, 2028, 2029, 2030], []);

  const formatCurrency = useCallback((val) => 
    `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 
  []);

  const getDateRange = useCallback((month, year) => {
    const start = new Date(year, month, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
    return { start, end };
  }, []);

  // Modals
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: maskCurrency('0'),
    currentAmount: maskCurrency('0'),
    deadline: '',
    category_id: ''
  });

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

      const [contractsRes, paymentsRes] = await Promise.all([
        api.get(`/contracts/${user.id}`),
        api.get(`/payments/${user.id}`)
      ]);
      setContracts(contractsRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', {
        ...goalForm,
        targetAmount: sanitizeValue(goalForm.targetAmount),
        currentAmount: sanitizeValue(goalForm.currentAmount)
      });
      setShowGoalModal(false);
      setGoalForm({
        title: '',
        targetAmount: maskCurrency('0'),
        currentAmount: maskCurrency('0'),
        deadline: '',
        category_id: ''
      });
      success('Novo limite orçamentário definido!');
      fetchData();
    } catch (err) { error('Falha ao registrar orçamento'); }
  };

  const handleOpenGoalModal = () => {
    setGoalForm({
      title: '',
      targetAmount: maskCurrency('0'),
      currentAmount: maskCurrency('0'),
      deadline: '',
      category_id: ''
    });
    setShowGoalModal(true);
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
    const client = user;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setTextColor(240, 240, 240);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text('2BI PLANEJAMENTO', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
    doc.restoreGraphicsState();

    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, pageWidth, 40, 'F');

    try {
      const logo = await preloadImage('/logo_2bi.png');
      doc.addImage(logo, 'PNG', 20, 8, 20, 20);
    } catch (err) { console.error('Erro ao carregar logo para o PDF:', err); }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 45, 25);

    doc.setTextColor(197, 160, 89);
    doc.setFontSize(8);
    doc.text('ESTRATÉGIA • PATRIMÔNIO • INTELIGÊNCIA FINANCEIRA', 45, 32);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    const docId = `REF: 2BI-${Date.now().toString().slice(-6)}`;
    doc.text(docId, pageWidth - 20, 15, { align: 'right' });
    doc.text(`GERADO EM: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 20, 20, { align: 'right' });

    const hasSetup = Number(contract.setupValue) > 0;
    const hasMonthly = Number(contract.monthlyValue) > 0;

    let y = 60;
    doc.setDrawColor(197, 160, 89);
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

    y = pageHeight - 60;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 90, y);
    doc.line(120, y, pageWidth - 20, y);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(client.name, 55, y + 5, { align: 'center' });
    doc.text('Contratante', 55, y + 10, { align: 'center' });

    doc.text('2BI PLANEJAMENTO', 155, y + 5, { align: 'center' });
    doc.text('Contratada', 155, y + 10, { align: 'center' });

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

  const mainChartData = useMemo(() => [
    { name: 'Receitas', value: stats.income, color: '#00F5A0' },
    { name: 'Despesas', value: stats.expense, color: '#FF4D4D' },
  ], [stats.income, stats.expense]);

  if (loading) {
    return (
      <SystemLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      </SystemLayout>
    );
  }

  return (
    <SystemLayout>
      <div className="space-y-8">
        <DashboardHeader 
          user={user}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          months={months}
          years={years}
          onOpenGoalModal={handleOpenGoalModal}
        />

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
            <DailyQuote />
            <StatsGrid stats={stats} />
            <PerformanceIndicators stats={stats} dashboardData={dashboardData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <MainCharts data={mainChartData} formatCurrency={formatCurrency} />
              <BudgetOverview goals={goals} onOpenGoalModal={handleOpenGoalModal} />
            </div>

            <RecentTransactions transactions={transactions} />
          </>
        ) : activeTab === 'billing' ? (
          <BillingSection 
            contracts={contracts} 
            payments={payments} 
            onDownloadContract={handleDownloadContract} 
          />
        ) : (
          <StrategicDashboard 
            dashboardData={dashboardData}
            selectedYear={selectedYear}
            theme={theme}
            stats={stats}
            formatCurrency={formatCurrency}
          />
        )}
      </div>

      <GoalModal 
        show={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSubmit={handleGoalSubmit}
        form={goalForm}
        setForm={setGoalForm}
        categories={categories}
      />
    </SystemLayout>
  );
};

export default ClientDashboard;

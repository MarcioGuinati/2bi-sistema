import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Briefcase,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
  DollarSign,
  PieChart,
  Plus,
  Trash2,
  FileText,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowRight,
  ExternalLink,
  X
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const steps = [
  { id: 1, title: 'Apresentação', icon: FileText },
  { id: 2, title: 'Identificação', icon: User },
  { id: 3, title: 'Poupar Mensal', icon: TrendingUp },
  { id: 4, title: 'Patrimônio', icon: Briefcase },
  { id: 5, title: 'Proteções', icon: Shield },
  { id: 6, title: 'Investimentos', icon: Briefcase },
  { id: 7, title: 'Renda', icon: CreditCard },
  { id: 8, title: 'Fluxo/Gastos', icon: DollarSign },
  { id: 9, title: 'Review', icon: PieChart },
  { id: 10, title: 'Fechamento', icon: FileText },
];

const ClientOnboarding = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPDFMaximized, setIsPDFMaximized] = useState(false);

  const [data, setData] = useState({
    personal: { name: '', birthDate: '' },
    objectives: [
      { id: 'house', label: 'Imóvel próprio', selected: false, why: '', when: '', value: '', saved: '', priority: '' },
      { id: 'invest_property', label: 'Investimento imobiliário', selected: false, why: '', when: '', value: '', saved: '', priority: '' },
      { id: 'trips', label: 'Viagens', selected: false, why: '', when: '', value: '', saved: '', priority: '' },
      { id: 'retirement', label: 'Aposentadoria', selected: false, why: '', when: '', value: '', saved: '', priority: '' },
      { id: 'organization', label: 'Organização financeira', selected: false, why: '', when: '', value: '', saved: '', priority: '' },
      { id: 'educ_kids', label: 'Ajudar os filhos nos estudos', selected: false, why: '', when: '', value: '', saved: '', priority: '' },
      { id: 'investments', label: 'Investimentos', selected: false, why: '', when: '', value: '', saved: '', priority: '' },
      { id: 'car', label: 'Compra ou troca de carro', selected: false, why: '', when: '', value: '', saved: '', priority: '' },
    ],
    planning: { monthlyInvest: '', futureChanges: '' },
    assets: {
      vehicles: [],
      properties: [],
      others: []
    },
    protections: { lifeInsurance: false, profInsurance: false, healthPlan: false, insuranceNotes: '' },
    retirement: { age: '70', desiredIncome: '', alreadySaving: false, onlyINSS: '' },
    investments: { types: '', riskProfile: '', alreadyInvests: false },
    cards: { list: [{ bank: '', annuity: 'Não', miles: 'Não', limit: '', monthlySpend: '' }] },
    cashFlow: {
      salaries: '', otherIncome: '',
      fixed: {
        housing: '', food: '', transport: '', health: '', energy: '', water: '', internet: '', others: []
      },
      variable: {
        housing: '', food: '', transport: '', health: '', others: []
      },
      expected: {
        income: '', fixed: '', variable: '', investments: ''
      }
    },
    investimentoMensal: {
      valorMinimo: '',
      valorMaximo: '',
      valorMedio: '',
      consegueComecar: '',
      mudancasPrevistas: '',
      acompanhaFinancas: ''
    }
  });

  const formatCurrency = (value) => {
    if (!value) return '';
    const cleanValue = value.toString().replace(/\D/g, '');
    if (!cleanValue) return '';
    const options = { style: 'currency', currency: 'BRL' };
    return new Intl.NumberFormat('pt-BR', options).format(
      parseFloat(cleanValue) / 100
    );
  };

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await api.get('/clients');
        const found = res.data.find(c => c.id === id);
        if (found) {
          setClient(found);
          if (found.onboardingData && Object.keys(found.onboardingData).length > 0) {
            setData(prev => ({ ...prev, ...found.onboardingData }));
          } else {
            setData(prev => ({
              ...prev,
              personal: { name: found.name, birthDate: '' }
            }));
          }
        }
      } catch (err) {
        error('Erro ao buscar dados do cliente');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/clients/${id}`, { onboardingData: data });
      success('Configuração salva estrategicamente!');
      navigate('/admin');
    } catch (err) {
      error('Falha ao sincronizar dados');
    }
  };

  const nextStep = () => currentStep < steps.length && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  // Calculations
  const calculatedTotals = useMemo(() => {
    const parseCurrency = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      return parseFloat(val.toString().replace(/\D/g, '') || 0) / 100;
    };

    const incomeTotal = parseCurrency(data.cashFlow.salaries) + parseCurrency(data.cashFlow.otherIncome);

    const fixedTotal = Object.entries(data.cashFlow.fixed)
      .filter(([key, v]) => key !== 'others' && (typeof v === 'string' || typeof v === 'number'))
      .reduce((sum, [_, v]) => sum + parseCurrency(v), 0) +
      (data.cashFlow.fixed.others?.reduce((sum, o) => sum + parseCurrency(o.value), 0) || 0);

    const variableTotal = Object.entries(data.cashFlow.variable)
      .filter(([key, v]) => key !== 'others' && (typeof v === 'string' || typeof v === 'number'))
      .reduce((sum, [_, v]) => sum + parseCurrency(v), 0) +
      (data.cashFlow.variable.others?.reduce((sum, o) => sum + parseCurrency(o.value), 0) || 0);

    const result = incomeTotal - fixedTotal - variableTotal;

    return { incomeTotal, fixedTotal, variableTotal, result };
  }, [data]);

  const generatePDF = async () => {
    window.print();
  };

  const getGapAnalysis = () => {
    const gaps = [];
    if (!data.protections.lifeInsurance) gaps.push('Seguro de Vida (Proteção Familiar)');
    if (!data.protections.profInsurance) gaps.push('Seguro Profissional (DIT)');
    if (!data.protections.healthPlan) gaps.push('Plano de Saúde Adequado');
    if (!data.retirement.alreadySaving) gaps.push('Plano de Aposentadoria Estruturado');
    return gaps;
  };

  const getProjectionData = () => {
    const rawSaving = data.planning.monthlyInvest || '0';
    const monthlySaving = parseFloat(rawSaving.replace(/\D/g, '') || 0) / 100;
    const years = 20;
    const projection = [];

    for (let year = 0; year <= years; year++) {
      const months = year * 12;
      // Compound interest formula: FV = P * [((1 + r)^n - 1) / r]
      const r8 = 0.08 / 12;
      const r10 = 0.10 / 12;

      const v8 = monthlySaving * ((Math.pow(1 + r8, months) - 1) / r8);
      const v10 = monthlySaving * ((Math.pow(1 + r10, months) - 1) / r10);

      projection.push({
        year: `Ano ${year}`,
        'Rentabilidade 8%': Math.round(v8),
        'Rentabilidade 10%': Math.round(v10),
      });
    }
    return projection;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] p-8 md:p-12 border border-[var(--border-primary)] shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black font-heading tracking-tighter text-[var(--text-primary)]">Apresentação Estratégica</h3>
                  <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em] font-medium italic">Metodologia 2BI Planejamento</p>
                </div>
                <a
                  href="/apresentacao.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-8 py-4 flex items-center gap-3 text-xs"
                >
                  <ExternalLink size={18} /> Abrir em Nova Aba
                </a>
              </div>

              <div className="relative group">
                <div className={`aspect-[16/9] w-full bg-navy-900 rounded-[2rem] overflow-hidden border-4 border-gold/20 shadow-2xl transition-all duration-500 ${isPDFMaximized ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  <iframe
                    src="/apresentacao.pdf#toolbar=0&navpanes=0&scrollbar=0"
                    className="w-full h-full"
                    title="Apresentação 2BI"
                  ></iframe>
                </div>
                {!isPDFMaximized && (
                  <button
                    onClick={() => setIsPDFMaximized(true)}
                    className="absolute bottom-6 right-6 bg-gold text-navy-900 p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all font-black flex items-center gap-2 text-xs uppercase tracking-widest z-[20]"
                  >
                    <ExternalLink size={18} /> Expandir Apresentação
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isPDFMaximized && (
                  <motion.div
                    key="pdf-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-navy-900/95 backdrop-blur-xl z-[100] flex flex-col p-4 md:p-10"
                  >
                    <div className="flex justify-between items-center mb-6 text-white shrink-0">
                      <div>
                        <h3 className="text-2xl font-black italic tracking-tighter">Metodologia 2BI Planejamento</h3>
                        <p className="text-gold text-[10px] font-black uppercase tracking-widest">Visualização Estratégica Expandida</p>
                      </div>
                      <button
                        onClick={() => setIsPDFMaximized(false)}
                        className="bg-white/10 p-4 rounded-2xl hover:bg-red-500 transition-colors flex items-center gap-3 font-black text-xs uppercase"
                      >
                        <X size={24} /> Sair do Foco
                      </button>
                    </div>
                    <div className="flex-1 bg-black rounded-[2.5rem] overflow-hidden border-4 border-gold/30 shadow-[0_0_50px_rgba(197,160,89,0.2)]">
                      <iframe
                        src="/apresentacao.pdf"
                        className="w-full h-full"
                        title="Apresentação 2BI Expandida"
                      ></iframe>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-10 p-8 bg-blue-50/10 rounded-3xl border border-blue-500/20 text-center animate-pulse">
                <p className="text-[var(--text-secondary)] text-sm font-bold tracking-tight">Utilize os controles do mouse para navegar nos slides acima, ou avance para iniciar o mapeamento.</p>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-2">Nome Completo</label>
                <input
                  type="text"
                  value={data.personal.name}
                  onChange={e => setData({ ...data, personal: { ...data.personal, name: e.target.value } })}
                  className="input-premium font-bold"
                  placeholder="Nome do Cliente"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-2">Data de Nascimento</label>
                <input
                  type="date"
                  value={data.personal.birthDate}
                  onChange={e => setData({ ...data, personal: { ...data.personal, birthDate: e.target.value } })}
                  className="input-premium font-bold"
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-[var(--border-primary)]">
              <h4 className="text-sm font-black uppercase text-gold tracking-[0.2em]">Objetivos Principais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.objectives.map((obj, idx) => (
                  <div key={obj.id} className={`p-6 rounded-[2rem] border-2 transition-all ${obj.selected ? 'border-gold bg-gold/5' : 'border-[var(--border-primary)] bg-[var(--bg-primary)]'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <input
                        type="checkbox"
                        checked={obj.selected}
                        onChange={() => {
                          const newObjs = [...data.objectives];
                          newObjs[idx].selected = !newObjs[idx].selected;
                          setData({ ...data, objectives: newObjs });
                        }}
                        className="w-5 h-5 rounded-lg border-2 border-slate-300 text-gold focus:ring-gold"
                      />
                      <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">{obj.label}</span>
                    </div>
                    {obj.selected && (
                      <div className="mt-4 space-y-4">
                        <textarea
                          placeholder="Por que este objetivo é importante agora?"
                          value={obj.why}
                          onChange={e => {
                            const newObjs = [...data.objectives];
                            newObjs[idx].why = e.target.value;
                            setData({ ...data, objectives: newObjs });
                          }}
                          className="w-full bg-[var(--bg-secondary)] border border-gold/20 rounded-2xl p-4 text-xs outline-none focus:border-gold/50 h-20 resize-none text-[var(--text-primary)]"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--text-secondary)] ml-1">Para quando? (Meta)</label>
                            <input
                              type="date"
                              value={obj.when || ''}
                              onChange={e => {
                                const newObjs = [...data.objectives];
                                newObjs[idx].when = e.target.value;
                                setData({ ...data, objectives: newObjs });
                              }}
                              className="input-premium px-3 py-2 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--text-secondary)] ml-1">Quanto?</label>
                            <input
                              type="text"
                              placeholder="R$ 0,00"
                              value={obj.value || ''}
                              onChange={e => {
                                const newObjs = [...data.objectives];
                                newObjs[idx].value = formatCurrency(e.target.value);
                                setData({ ...data, objectives: newObjs });
                              }}
                              className="input-premium px-3 py-2 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--text-secondary)] ml-1">Quanto já guardou?</label>
                            <input
                              type="text"
                              placeholder="R$ 0,00"
                              value={obj.saved || ''}
                              onChange={e => {
                                const newObjs = [...data.objectives];
                                newObjs[idx].saved = formatCurrency(e.target.value);
                                setData({ ...data, objectives: newObjs });
                              }}
                              className="input-premium px-3 py-2 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-[var(--text-secondary)] ml-1">Prioridade</label>
                            <div className="flex flex-wrap gap-2">
                              {['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°'].map(p => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => {
                                    const newObjs = [...data.objectives];
                                    newObjs[idx].priority = p;
                                    setData({ ...data, objectives: newObjs });
                                  }}
                                  className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${obj.priority === p ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-gold/50'}`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="space-y-6">
              <label className="text-xs font-black uppercase text-gold tracking-widest px-2">Investimento Mensal</label>

              <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] p-8 md:p-10 border border-[var(--border-primary)] shadow-xl space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] ml-2">
                    Hoje, focado nos seus 3 principais objetivos, quanto você consegue poupar com tranquilidade?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-black text-slate-400 ml-4 italic">Valor Mínimo</label>
                      <input
                        type="text"
                        value={data.investimentoMensal.valorMinimo}
                        onChange={e => setData({ ...data, investimentoMensal: { ...data.investimentoMensal, valorMinimo: formatCurrency(e.target.value) } })}
                        className="input-premium text-xl font-black text-center py-5 border-blue-200"
                        placeholder="Mínimo"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-black text-gold ml-4 italic">Valor Médio</label>
                      <input
                        type="text"
                        value={data.investimentoMensal.valorMedio}
                        onChange={e => setData({ ...data, investimentoMensal: { ...data.investimentoMensal, valorMedio: formatCurrency(e.target.value) } })}
                        className="input-premium text-xl font-black text-gold text-center py-5 border-gold/30"
                        placeholder="Média"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-black text-slate-400 ml-4 italic">Valor Máximo</label>
                      <input
                        type="text"
                        value={data.investimentoMensal.valorMaximo}
                        onChange={e => setData({ ...data, investimentoMensal: { ...data.investimentoMensal, valorMaximo: formatCurrency(e.target.value) } })}
                        className="input-premium text-xl font-black text-center py-5 border-blue-200"
                        placeholder="Máximo"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] ml-2 leading-relaxed">
                    Trazendo um conceito focado nos objetivos citados e que se enquadre no seu perfil financeiro, você consegue começar desde já?
                  </label>
                  <textarea
                    value={data.investimentoMensal.consegueComecar}
                    onChange={e => setData({ ...data, investimentoMensal: { ...data.investimentoMensal, consegueComecar: e.target.value } })}
                    className="input-premium h-24 resize-none text-sm"
                    placeholder="Responda aqui..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] ml-2">
                      Mudanças previstas (próximos meses)?
                    </label>
                    <input
                      type="text"
                      value={data.investimentoMensal.mudancasPrevistas}
                      onChange={e => setData({ ...data, investimentoMensal: { ...data.investimentoMensal, mudancasPrevistas: e.target.value } })}
                      className="input-premium py-4"
                      placeholder="Ex: Aumento salarial"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] ml-2">
                      Acompanha assuntos financeiros?
                    </label>
                    <input
                      type="text"
                      value={data.investimentoMensal.acompanhaFinancas}
                      onChange={e => setData({ ...data, investimentoMensal: { ...data.investimentoMensal, acompanhaFinancas: e.target.value } })}
                      className="input-premium py-4"
                      placeholder="Ex: Sim, diariamente"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="flex justify-between items-center px-2">
              <label className="text-sm font-black uppercase text-gold tracking-widest italic">Patrimônio Atual</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setData({ ...data, assets: { ...data.assets, vehicles: [...data.assets.vehicles, { brand: '', model: '', year: '', fipe: '', isPaidOff: 'Sim', hasInsurance: 'Não' }] } })}
                  className="bg-gold/10 text-gold px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-gold hover:text-white transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Veículo
                </button>
                <button
                  onClick={() => setData({ ...data, assets: { ...data.assets, properties: [...data.assets.properties, { description: '', value: '', isPaidOff: 'Sim', hasInsurance: 'Não' }] } })}
                  className="bg-gold/10 text-gold px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-gold hover:text-white transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Imóvel
                </button>
                <button
                  onClick={() => setData({ ...data, assets: { ...data.assets, others: [...data.assets.others, { description: '', value: '' }] } })}
                  className="bg-gold/10 text-gold px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-gold hover:text-white transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Bem
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Veículos */}
              {data.assets.vehicles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-black text-slate-400 bg-slate-100 dark:bg-white/5 py-2 px-4 rounded-lg inline-block tracking-widest">Veículos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.assets.vehicles.map((v, idx) => (
                      <div key={idx} className="bg-[var(--bg-secondary)] p-6 rounded-[2rem] border-2 border-[var(--border-primary)] relative group">
                        <button
                          onClick={() => {
                            const newList = data.assets.vehicles.filter((_, i) => i !== idx);
                            setData({ ...data, assets: { ...data.assets, vehicles: newList } });
                          }}
                          className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Marca</label>
                            <input type="text" value={v.brand} onChange={e => {
                              const newList = [...data.assets.vehicles]; newList[idx].brand = e.target.value;
                              setData({ ...data, assets: { ...data.assets, vehicles: newList } });
                            }} className="input-premium px-4 py-3 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Modelo</label>
                            <input type="text" value={v.model} onChange={e => {
                              const newList = [...data.assets.vehicles]; newList[idx].model = e.target.value;
                              setData({ ...data, assets: { ...data.assets, vehicles: newList } });
                            }} className="input-premium px-4 py-3 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Ano</label>
                            <input type="text" value={v.year} onChange={e => {
                              const newList = [...data.assets.vehicles]; newList[idx].year = e.target.value;
                              setData({ ...data, assets: { ...data.assets, vehicles: newList } });
                            }} className="input-premium px-4 py-3 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Valor FIPE</label>
                            <input type="text" value={v.fipe} onChange={e => {
                              const newList = [...data.assets.vehicles]; newList[idx].fipe = formatCurrency(e.target.value);
                              setData({ ...data, assets: { ...data.assets, vehicles: newList } });
                            }} className="input-premium px-4 py-3 text-sm font-black text-gold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-primary)]">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Quitado?</label>
                            <div className="flex gap-2">
                              {['Sim', 'Não'].map(opt => (
                                <button key={opt} onClick={() => {
                                  const newList = [...data.assets.vehicles]; newList[idx].isPaidOff = opt;
                                  setData({ ...data, assets: { ...data.assets, vehicles: newList } });
                                }} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${v.isPaidOff === opt ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20' : 'bg-white/10 dark:bg-white/5 opacity-50 hover:opacity-100'}`}>{opt}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Seguro?</label>
                            <div className="flex gap-2">
                              {['Sim', 'Não'].map(opt => (
                                <button key={opt} onClick={() => {
                                  const newList = [...data.assets.vehicles]; newList[idx].hasInsurance = opt;
                                  setData({ ...data, assets: { ...data.assets, vehicles: newList } });
                                }} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${v.hasInsurance === opt ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20' : 'bg-white/10 dark:bg-white/5 opacity-50 hover:opacity-100'}`}>{opt}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Imóveis */}
              {data.assets.properties.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-black text-slate-400 bg-slate-100 dark:bg-white/5 py-2 px-4 rounded-lg inline-block tracking-widest">Imóveis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.assets.properties.map((p, idx) => (
                      <div key={idx} className="bg-[var(--bg-secondary)] p-6 rounded-[2rem] border-2 border-[var(--border-primary)] relative group">
                        <button
                          onClick={() => {
                            const newList = data.assets.properties.filter((_, i) => i !== idx);
                            setData({ ...data, assets: { ...data.assets, properties: newList } });
                          }}
                          className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Descrição</label>
                            <input type="text" placeholder="Ex: Casa em Condomínio" value={p.description} onChange={e => {
                              const newList = [...data.assets.properties]; newList[idx].description = e.target.value;
                              setData({ ...data, assets: { ...data.assets, properties: newList } });
                            }} className="input-premium px-4 py-3 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Valor Estimado</label>
                            <input type="text" value={p.value} onChange={e => {
                              const newList = [...data.assets.properties]; newList[idx].value = formatCurrency(e.target.value);
                              setData({ ...data, assets: { ...data.assets, properties: newList } });
                            }} className="input-premium px-4 py-3 text-sm font-black text-gold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-primary)]">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold text-slate-400">Quitado?</label>
                              <div className="flex gap-2">
                                {['Sim', 'Não'].map(opt => (
                                  <button key={opt} onClick={() => {
                                    const newList = [...data.assets.properties]; newList[idx].isPaidOff = opt;
                                    setData({ ...data, assets: { ...data.assets, properties: newList } });
                                  }} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${p.isPaidOff === opt ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20' : 'bg-white/10 dark:bg-white/5 opacity-50 hover:opacity-100'}`}>{opt}</button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold text-slate-400">Seguro?</label>
                              <div className="flex gap-2">
                                {['Sim', 'Não'].map(opt => (
                                  <button key={opt} onClick={() => {
                                    const newList = [...data.assets.properties]; newList[idx].hasInsurance = opt;
                                    setData({ ...data, assets: { ...data.assets, properties: newList } });
                                  }} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${p.hasInsurance === opt ? 'bg-gold text-navy-900 shadow-lg shadow-gold/20' : 'bg-white/10 dark:bg-white/5 opacity-50 hover:opacity-100'}`}>{opt}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outros Bens */}
              {data.assets.others.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-black text-slate-400 bg-slate-100 dark:bg-white/5 py-2 px-4 rounded-lg inline-block tracking-widest">Outros Bens</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.assets.others.map((o, idx) => (
                      <div key={idx} className="bg-[var(--bg-secondary)] p-5 rounded-2xl border border-[var(--border-primary)] relative group">
                        <button
                          onClick={() => {
                            const newList = data.assets.others.filter((_, i) => i !== idx);
                            setData({ ...data, assets: { ...data.assets, others: newList } });
                          }}
                          className="absolute top-2 right-2 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                        <input type="text" placeholder="Bem" value={o.description} onChange={e => {
                          const newList = [...data.assets.others]; newList[idx].description = e.target.value;
                          setData({ ...data, assets: { ...data.assets, others: newList } });
                        }} className="bg-transparent border-b border-[var(--border-primary)] w-full mb-2 text-sm py-2 focus:border-gold outline-none" />
                        <input type="text" placeholder="Valor" value={o.value} onChange={e => {
                          const newList = [...data.assets.others]; newList[idx].value = formatCurrency(e.target.value);
                          setData({ ...data, assets: { ...data.assets, others: newList } });
                        }} className="bg-transparent w-full text-sm font-black text-gold outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.assets.vehicles.length === 0 && data.assets.properties.length === 0 && data.assets.others.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-[var(--border-primary)] rounded-[3rem]">
                  <Briefcase size={40} className="mx-auto text-slate-300 mb-4 opacity-50" />
                  <p className="text-sm font-bold text-slate-400">Clique em um dos botões acima para adicionar bens ao seu patrimônio.</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="space-y-6">
              <label className="text-xs font-black uppercase text-gold tracking-widest px-2">Proteções Atuais</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'lifeInsurance', label: 'Seguro de Vida' },
                  { key: 'profInsurance', label: 'Seguro Profissional' },
                  { key: 'healthPlan', label: 'Plano de Saúde' }
                ].map(prot => (
                  <button
                    key={prot.key}
                    type="button"
                    onClick={() => setData({ ...data, protections: { ...data.protections, [prot.key]: !data.protections[prot.key] } })}
                    className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all duration-300 ${
                      data.protections[prot.key] 
                        ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.15)] scale-[1.02]' 
                        : 'border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-secondary)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="font-bold text-xs uppercase tracking-tight">{prot.label}</span>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${data.protections[prot.key] ? 'border-green-500 bg-green-600 shadow-lg shadow-green-500/30' : 'border-slate-300 dark:border-white/10'}`}>
                      {data.protections[prot.key] && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Observações adicionais sobre proteções (valores, coberturas...)"
                value={data.protections.insuranceNotes}
                onChange={e => setData({ ...data, protections: { ...data.protections, insuranceNotes: e.target.value } })}
                className="input-premium h-20"
              />
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="bg-navy-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/10 rounded-full translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <h4 className="text-xl font-black italic mb-8 border-l-4 border-gold pl-4">Projeção de Aposentadoria</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Idade pretendida</label>
                  <input type="number" value={data.retirement.age} onChange={e => setData({ ...data, retirement: { ...data.retirement, age: e.target.value } })} className="bg-white/10 border-white/20 text-white w-full p-4 rounded-2xl outline-none focus:border-gold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Renda mensal desejada</label>
                  <input type="text" value={data.retirement.desiredIncome} onChange={e => setData({ ...data, retirement: { ...data.retirement, desiredIncome: formatCurrency(e.target.value) } })} className="bg-white/10 border-white/20 text-white w-full p-4 rounded-2xl outline-none focus:border-gold font-black" placeholder="R$ 0,00" />
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Já poupa hoje?</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setData({ ...data, retirement: { ...data.retirement, alreadySaving: true } })} className={`flex-1 py-3 rounded-xl font-bold text-xs ${data.retirement.alreadySaving ? 'bg-gold text-navy-900' : 'bg-white/10'}`}>Sim</button>
                    <button type="button" onClick={() => setData({ ...data, retirement: { ...data.retirement, alreadySaving: false } })} className={`flex-1 py-3 rounded-xl font-bold text-xs ${!data.retirement.alreadySaving ? 'bg-gold text-navy-900' : 'bg-white/10'}`}>Não</button>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Pretende usar INSS?</label>
                  <input type="text" value={data.retirement.onlyINSS} onChange={e => setData({ ...data, retirement: { ...data.retirement, onlyINSS: e.target.value } })} className="bg-white/10 border-white/20 text-white w-full p-3 rounded-xl outline-none focus:border-gold text-xs" placeholder="Ex: Somente INSS" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-xs font-black uppercase text-gold tracking-widest px-2">Investimentos Atuais</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Tipos de investimentos</label>
                  <input type="text" value={data.investments.types} onChange={e => setData({ ...data, investments: { ...data.investments, types: e.target.value } })} className="input-premium text-sm" placeholder="Ex: CDB, Ações, FIIs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Perfil de risco</label>
                  <input type="text" value={data.investments.riskProfile} onChange={e => setData({ ...data, investments: { ...data.investments, riskProfile: e.target.value } })} className="input-premium text-sm" placeholder="Ex: Moderado / Agressivo" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black uppercase text-gold tracking-widest px-2 italic">Gerenciamento de Cartões</label>
              <button
                type="button"
                onClick={() => setData({ ...data, cards: { list: [...data.cards.list, { bank: '', annuity: 'Não', miles: 'Não', limit: '', monthlySpend: '' }] } })}
                className="text-[10px] bg-gold/10 text-gold px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gold hover:text-white transition-all shadow-sm"
              >
                <Plus size={14} /> Adicionar Cartão
              </button>
            </div>
            <div className="space-y-4">
              {data.cards.list.map((card, idx) => (
                <div key={idx} className="card-premium p-6 relative group bg-[var(--bg-secondary)] border-2 border-transparent hover:border-gold/20 transition-all">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input value={card.bank} onChange={e => {
                      const newList = [...data.cards.list];
                      newList[idx].bank = e.target.value;
                      setData({ ...data, cards: { list: newList } });
                    }} className="input-premium text-xs" placeholder="Qual cartão?" />
                    <input value={card.limit} onChange={e => {
                      const newList = [...data.cards.list];
                      newList[idx].limit = formatCurrency(e.target.value);
                      setData({ ...data, cards: { list: newList } });
                    }} className="input-premium text-xs font-bold" placeholder="Limite (R$)" />
                    <input value={card.monthlySpend} onChange={e => {
                      const newList = [...data.cards.list];
                      newList[idx].monthlySpend = formatCurrency(e.target.value);
                      setData({ ...data, cards: { list: newList } });
                    }} className="input-premium text-xs font-black text-red-500" placeholder="Gasto médio" />
                    <div className="flex gap-2">
                      <input value={card.annuity} onChange={e => {
                        const newList = [...data.cards.list];
                        newList[idx].annuity = e.target.value;
                        setData({ ...data, cards: { list: newList } });
                      }} className="input-premium text-[10px] w-full" placeholder="Anuidade?" />
                      <button
                        type="button"
                        onClick={() => {
                          const newList = data.cards.list.filter((_, i) => i !== idx);
                          setData({ ...data, cards: { list: newList } });
                        }}
                        className="p-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            {/* NOVO BLOCO DE RENDA NO TOPO DOS GASTOS */}
            <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] p-8 border border-gold/10 shadow-xl space-y-6">
              <label className="text-xs font-black uppercase text-gold tracking-widest flex items-center gap-2">
                <DollarSign size={16} /> Renda e Fluxo Mensal
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-2">Salário Líquido (Mensal)</label>
                  <input type="text" value={data.cashFlow.salaries} onChange={e => setData({ ...data, cashFlow: { ...data.cashFlow, salaries: formatCurrency(e.target.value) } })} className="input-premium text-2xl font-black text-green-600 py-6" placeholder="R$ 10.000,00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-2">Outras Rendas / Extras</label>
                  <input type="text" value={data.cashFlow.otherIncome} onChange={e => setData({ ...data, cashFlow: { ...data.cashFlow, otherIncome: formatCurrency(e.target.value) } })} className="input-premium text-2xl font-black text-green-500 py-6" placeholder="R$ 0,00" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* FIXED EXPENSES */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-gold/20 pb-4">
                  <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center font-black text-xs shadow-sm">1</div>
                  <h4 className="text-sm font-black uppercase tracking-widest italic">Gastos Fixos</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['housing', 'food', 'transport', 'health', 'energy', 'water', 'internet'].map(field => (
                    <div key={field} className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] ml-1">{
                        field === 'housing' ? 'Moradia' :
                          field === 'food' ? 'Alimentação' :
                            field === 'transport' ? 'Transporte' :
                              field === 'health' ? 'Saúde' :
                                field === 'energy' ? 'Energia' :
                                  field === 'water' ? 'Água' : 'Internet'
                      }</label>
                      <input type="text" value={data.cashFlow.fixed[field]} onChange={e => setData({ ...data, cashFlow: { ...data.cashFlow, fixed: { ...data.cashFlow.fixed, [field]: formatCurrency(e.target.value) } } })} className="input-premium px-4 py-4 text-sm font-bold" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-primary)]">
                    <span className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Outros Fixos</span>
                    <button type="button" onClick={() => setData({ ...data, cashFlow: { ...data.cashFlow, fixed: { ...data.cashFlow.fixed, others: [...(data.cashFlow.fixed.others || []), { label: '', value: '' }] } } })} className="text-[10px] text-gold font-bold uppercase">Adicionar +</button>
                  </div>
                  {(data.cashFlow.fixed.others || []).map((oth, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input value={oth.label} onChange={e => {
                        const newOthers = [...data.cashFlow.fixed.others];
                        newOthers[idx].label = e.target.value;
                        setData({ ...data, cashFlow: { ...data.cashFlow, fixed: { ...data.cashFlow.fixed, others: newOthers } } });
                      }} className="input-premium text-xs flex-1 py-4" placeholder="Ex: Celular" />
                      <input type="text" value={oth.value} onChange={e => {
                        const newOthers = [...data.cashFlow.fixed.others];
                        newOthers[idx].value = formatCurrency(e.target.value);
                        setData({ ...data, cashFlow: { ...data.cashFlow, fixed: { ...data.cashFlow.fixed, others: newOthers } } });
                      }} className="input-premium text-xs w-32 py-4 font-black text-gold" />
                      <button type="button" onClick={() => {
                        const newOthers = data.cashFlow.fixed.others.filter((_, i) => i !== idx);
                        setData({ ...data, cashFlow: { ...data.cashFlow, fixed: { ...data.cashFlow.fixed, others: newOthers } } });
                      }} className="text-red-400 p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* VARIABLE EXPENSES */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-gold/20 pb-4">
                  <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center font-black text-xs shadow-sm">2</div>
                  <h4 className="text-sm font-black uppercase tracking-widest italic">Gastos Variáveis</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['housing', 'food', 'transport', 'health'].map(field => (
                    <div key={field} className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] ml-1">{
                        field === 'housing' ? 'Moradia' :
                          field === 'food' ? 'Alimentação' :
                            field === 'transport' ? 'Transporte' : 'Saúde'
                      }</label>
                      <input type="text" value={data.cashFlow.variable[field]} onChange={e => setData({ ...data, cashFlow: { ...data.cashFlow, variable: { ...data.cashFlow.variable, [field]: formatCurrency(e.target.value) } } })} className="input-premium px-4 py-4 text-sm font-bold" />
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-primary)]">
                    <span className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Outros Variáveis</span>
                    <button type="button" onClick={() => setData({ ...data, cashFlow: { ...data.cashFlow, variable: { ...data.cashFlow.variable, others: [...(data.cashFlow.variable.others || []), { label: '', value: '' }] } } })} className="text-[10px] text-gold font-bold uppercase">Adicionar +</button>
                  </div>
                  {(data.cashFlow.variable.others || []).map((oth, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input value={oth.label} onChange={e => {
                        const newOthers = [...data.cashFlow.variable.others];
                        newOthers[idx].label = e.target.value;
                        setData({ ...data, cashFlow: { ...data.cashFlow, variable: { ...data.cashFlow.variable, others: newOthers } } });
                      }} className="input-premium text-xs flex-1 py-4" placeholder="Ex: Spotify" />
                      <input type="text" value={oth.value} onChange={e => {
                        const newOthers = [...data.cashFlow.variable.others];
                        newOthers[idx].value = formatCurrency(e.target.value);
                        setData({ ...data, cashFlow: { ...data.cashFlow, variable: { ...data.cashFlow.variable, others: newOthers } } });
                      }} className="input-premium text-xs w-32 py-4 font-black text-gold" />
                      <button type="button" onClick={() => {
                        const newOthers = data.cashFlow.variable.others.filter((_, i) => i !== idx);
                        setData({ ...data, cashFlow: { ...data.cashFlow, variable: { ...data.cashFlow.variable, others: newOthers } } });
                      }} className="text-red-400 p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 9:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* REALIDADE ATUAL */}
              <div className="bg-[var(--bg-secondary)] rounded-[3rem] p-10 border border-[var(--border-primary)] shadow-xl space-y-6">
                <h4 className="text-lg font-black italic border-l-4 border-navy-900 dark:border-gold pl-4 uppercase tracking-tighter text-[var(--text-primary)]">Realidade Atual</h4>
                <div className="space-y-4">
                  {[
                    { key: 'income', label: 'Receitas', val: calculatedTotals.incomeTotal, color: 'text-green-600', perc: 100 },
                    { key: 'fixed', label: 'Gastos Fixos', val: calculatedTotals.fixedTotal, color: 'text-red-600', perc: (calculatedTotals.fixedTotal / (calculatedTotals.incomeTotal || 1) * 100).toFixed(1) },
                    { key: 'variable', label: 'Gastos Variáveis', val: calculatedTotals.variableTotal, color: 'text-orange-500', perc: (calculatedTotals.variableTotal / (calculatedTotals.incomeTotal || 1) * 100).toFixed(1) },
                    { key: 'invest', label: 'Investimentos', val: 0, color: 'text-blue-500', perc: 0 },
                    { key: 'result', label: 'Resultado', val: calculatedTotals.result, color: 'text-[var(--text-primary)] bg-[var(--bg-primary)] p-4 rounded-xl', perc: (calculatedTotals.result / (calculatedTotals.incomeTotal || 1) * 100).toFixed(1) },
                  ].map(item => (
                    <div key={item.key} className="space-y-4">
                      <div className={`flex justify-between items-center ${item.label === 'Resultado' ? '' : 'pb-2 border-b border-[var(--border-primary)]'}`}>
                        <div>
                          <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{item.label}</div>
                          <div className={`text-lg font-black ${item.color.includes('text-') ? item.color.split(' ')[0] : 'text-[var(--text-primary)]'}`}>R$ {Number(item.val).toLocaleString('pt-BR')}</div>
                        </div>
                        <div className="text-right text-xs font-bold text-[var(--text-secondary)] italic">{item.perc}%</div>
                      </div>
                      
                      {/* SUB-ITENS DETALHADOS COM CORES DIFERENTES */}
                      {item.key === 'fixed' && calculatedTotals.fixedTotal > 0 && (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 pl-4 py-3 border-l-2 border-red-500/20 mb-4 bg-red-500/5 rounded-r-xl">
                          {[
                            { l: 'Moradia', v: data.cashFlow.fixed.housing },
                            { l: 'Alimentação', v: data.cashFlow.fixed.food },
                            { l: 'Transporte', v: data.cashFlow.fixed.transport },
                            { l: 'Saúde', v: data.cashFlow.fixed.health },
                            { l: 'Básicos (Luz/Água/Net)', v: (parseFloat(data.cashFlow.fixed.energy?.replace(/\D/g,'')||0)/100) + (parseFloat(data.cashFlow.fixed.water?.replace(/\D/g,'')||0)/100) + (parseFloat(data.cashFlow.fixed.internet?.replace(/\D/g,'')||0)/100) },
                            { l: 'Outros F.', v: data.cashFlow.fixed.others?.reduce((acc, o) => acc + parseFloat(o.value.replace(/\D/g,'')||0)/100, 0) }
                          ].filter(s => s.v && (typeof s.v === 'string' ? parseFloat(s.v.replace(/\D/g,'')) > 0 : s.v > 0)).map(sub => (
                            <div key={sub.l} className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-red-700/70 dark:text-red-400/70 uppercase tracking-tight">{sub.l}</span>
                              <span className="text-xs font-black text-red-600 italic">R$ {(typeof sub.v === 'string' ? parseFloat(sub.v.replace(/\D/g,'')||0)/100 : sub.v).toLocaleString('pt-BR')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.key === 'variable' && calculatedTotals.variableTotal > 0 && (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 pl-4 py-3 border-l-2 border-orange-500/20 mb-4 bg-orange-500/5 rounded-r-xl">
                          {[
                            { l: 'Moradia', v: data.cashFlow.variable.housing },
                            { l: 'Alimentação', v: data.cashFlow.variable.food },
                            { l: 'Transporte', v: data.cashFlow.variable.transport },
                            { l: 'Saúde', v: data.cashFlow.variable.health },
                            { l: 'Outros V.', v: data.cashFlow.variable.others?.reduce((acc, o) => acc + parseFloat(o.value.replace(/\D/g,'')||0)/100, 0) }
                          ].filter(s => s.v && (typeof s.v === 'string' ? parseFloat(s.v.replace(/\D/g,'')) > 0 : s.v > 0)).map(sub => (
                            <div key={sub.l} className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-orange-700/70 dark:text-orange-400/70 uppercase tracking-tight">{sub.l}</span>
                              <span className="text-xs font-black text-orange-600 italic">R$ {(typeof sub.v === 'string' ? parseFloat(sub.v.replace(/\D/g,'')||0)/100 : sub.v).toLocaleString('pt-BR')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* REALIDADE ESPERADA */}
              <div className="bg-navy-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden space-y-6 dark:border dark:border-gold/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
                <h4 className="text-lg font-black italic border-l-4 border-gold pl-4 uppercase tracking-tighter text-white">Projeção Estratégica</h4>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-white/30">Receita Esperada</label>
                    <input type="text" value={data.cashFlow.expected.income} onChange={e => setData({ ...data, cashFlow: { ...data.cashFlow, expected: { ...data.cashFlow.expected, income: formatCurrency(e.target.value) } } })} className="bg-white/5 border-white/10 w-full p-4 rounded-2xl outline-none focus:border-gold font-black" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-white/30">Meta Fixa (R$)</label>
                      <input type="text" value={data.cashFlow.expected.fixed} onChange={e => setData({ ...data, cashFlow: { ...data.cashFlow, expected: { ...data.cashFlow.expected, fixed: formatCurrency(e.target.value) } } })} className="bg-white/5 border-white/10 w-full p-4 rounded-2xl outline-none focus:border-gold font-black" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-white/30">Meta Variável (R$)</label>
                      <input type="text" value={data.cashFlow.expected.variable} onChange={e => setData({ ...data, cashFlow: { ...data.cashFlow, expected: { ...data.cashFlow.expected, variable: formatCurrency(e.target.value) } } })} className="bg-white/5 border-white/10 w-full p-4 rounded-2xl outline-none focus:border-gold font-black" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-white/30">Meta Investimento (R$)</label>
                    <input type="text" value={data.cashFlow.expected.investments} onChange={e => setData({ ...data, cashFlow: { ...data.cashFlow, expected: { ...data.cashFlow.expected, investments: formatCurrency(e.target.value) } } })} className="bg-white/5 border-white/10 w-full p-4 rounded-2xl outline-none focus:border-gold font-black text-gold text-center text-xl" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 10:
        const fee = calculatedTotals.incomeTotal * 12 * 0.03;
        const gaps = getGapAnalysis();
        const projectionData = getProjectionData();
        const cashFlowData = [
          { name: 'Fixos', value: calculatedTotals.fixedTotal, color: '#ef4444' },
          { name: 'Variáveis', value: calculatedTotals.variableTotal, color: '#f97316' },
          { name: 'Sobra', value: Math.max(0, calculatedTotals.result), color: '#c5a059' },
        ];

        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
            <div id="strategic-proposal" className="bg-[var(--bg-primary)] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-[var(--border-primary)] space-y-12 transition-colors">
              {/* FEE HEADER */}
              <div className="bg-navy-900 dark:bg-navy-800 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-center relative overflow-hidden shadow-2xl border border-gold/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <h4 className="text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4">Investimento para Implementação</h4>
                <div className="text-4xl md:text-7xl font-black text-white italic tracking-tighter mb-2">
                  R$ {fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex flex-col items-center gap-1 mb-6">
                  <div className="h-[1px] w-12 bg-gold/30 my-2"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold font-black text-xl md:text-2xl italic tracking-tighter">R$ 49,90</span>
                    <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest">/ mensal</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* OBJECTIVES PROGRESS */}
                <div className="space-y-6">
                  <h5 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-[var(--text-primary)]">
                    <TrendingUp className="text-gold" size={18} /> Objetivos vs Realidade
                  </h5>
                  <div className="space-y-4">
                    {data.objectives.filter(o => o.selected).map(obj => {
                      const goal = parseFloat(obj.value.replace(/\D/g, '') || 1) / 100;
                      const saved = parseFloat(obj.saved.replace(/\D/g, '') || 0) / 100;
                      const missing = Math.max(0, goal - saved);
                      const perc = Math.min(100, (saved / goal * 100)).toFixed(1);

                      return (
                        <div key={obj.id} className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-primary)] shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-sm text-[var(--text-primary)]">{obj.label}</span>
                            <span className="text-[10px] font-black bg-gold/10 text-gold px-3 py-1 rounded-full">{perc}%</span>
                          </div>
                          <div className="w-full h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]" style={{ width: `${perc}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[9px] font-black text-[var(--text-secondary)] uppercase">
                            <span>JÁ TEM: R$ {saved.toLocaleString()}</span>
                            <span className="text-red-500">FALTA: R$ {missing.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* GAP ANALYSIS */}
                <div className="space-y-6">
                  <h5 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-[var(--text-primary)]">
                    <AlertTriangle className="text-red-500" size={18} /> Pontos Cegos (Riscos)
                  </h5>
                  <div className="bg-red-500/5 dark:bg-red-500/10 rounded-3xl p-6 border border-red-500/20 space-y-4">
                    {gaps.length > 0 ? gaps.map((gap, i) => (
                      <div key={i} className="flex gap-3 items-center text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">
                        <X className="text-red-600 bg-white dark:bg-navy-900 rounded-full p-1 shadow-sm border border-red-100 dark:border-red-900/40" size={20} /> {gap}
                      </div>
                    )) : (
                      <div className="text-green-600 font-bold text-sm">Parabéns! Nenhuma vulnerabilidade crítica identificada.</div>
                    )}
                  </div>
                  <div className="p-8 bg-navy-900 dark:bg-navy-800 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-all"></div>
                    <p className="text-[10px] uppercase font-bold text-white/40 mb-3 tracking-widest">Observação Estratégica</p>
                    <p className="text-sm leading-relaxed italic opacity-90 font-medium">"A falta de blindagem patrimonial coloca em risco não apenas o seu futuro, mas a estabilidade de toda a família. A implementação deve priorizar estes GAPs."</p>
                  </div>
                </div>
              </div>

              {/* CHARTS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-[var(--border-primary)] pt-12">
                <div className="h-[350px] flex flex-col">
                  <h5 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2 text-[var(--text-primary)]">
                    <Activity className="text-gold" size={18} /> Projeção de Acúmulo (20 Anos)
                  </h5>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                      <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} stroke="var(--text-secondary)" />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `R$${v / 1000}k`} stroke="var(--text-secondary)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-primary)',
                          borderRadius: '16px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                      />
                      <Line type="monotone" dataKey="Rentabilidade 8%" stroke="#64748b" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="Rentabilidade 10%" stroke="#c5a059" strokeWidth={4} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[350px] flex flex-col">
                  <h5 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2 text-[var(--text-primary)]">
                    <PieChart className="text-orange-500" size={18} /> Fluxo de Caixa Atual
                  </h5>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                      <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="var(--text-secondary)" />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} stroke="var(--text-secondary)" />
                      <Tooltip
                        cursor={{ fill: 'rgba(197,160,89,0.05)' }}
                        contentStyle={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-primary)',
                          borderRadius: '16px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                        formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {cashFlowData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={generatePDF}
                className="bg-navy-900 text-white px-12 py-5 rounded-2xl flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] hover:bg-navy-800 transition-all shadow-2xl active:scale-95"
              >
                <FileText size={24} /> Imprimir Proposta Estratégica
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-navy-900 text-gold tracking-widest text-[10px] uppercase font-black">Carregando Perfil Comercial...</div>;

  return (
    <SystemLayout>
      <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 mt-6">
          <div>
            <div onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-4 cursor-pointer hover:translate-x-[-10px] transition-transform">
              <ChevronLeft size={14} /> Voltar
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-heading italic tracking-tighter text-[var(--text-primary)] uppercase">
              Mapeamento <span className="text-gold italic">360°</span>
            </h1>
            <p className="text-[var(--text-secondary)] font-medium max-w-xl mt-2 tracking-tight text-xs">Análise profunda do ecossistema financeiro para o sócio <span className="text-[var(--text-primary)] font-bold">{client?.name}</span>.</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary px-8 py-4 flex items-center gap-3 shadow-2xl shadow-gold/30 font-black text-sm transition-all active:scale-95"
          >
            <Save size={20} /> Salvar
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="flex flex-nowrap gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {steps.map((step) => {
            const Icon = step.icon;
            const active = currentStep === step.id;
            const completed = currentStep > step.id;
            return (
              <div
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex-1 min-w-[120px] p-4 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all border-2 relative ${active ? 'bg-navy-900 text-white border-navy-900 scale-105 shadow-xl' : completed ? 'bg-gold/10 text-gold border-gold/20' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)] opacity-60'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-2 ${active ? 'bg-gold border-gold text-navy-900' : 'bg-[var(--bg-primary)] border-transparent'}`}>
                  {completed ? <CheckCircle2 size={16} className="text-green-600" /> : <Icon size={16} />}
                </div>
                <div className="text-center">
                  <p className={`text-[7px] uppercase font-black tracking-widest ${active ? 'text-gold' : 'text-[var(--text-secondary)]'}`}>Passo 0{step.id}</p>
                  <p className="text-[9px] font-black uppercase whitespace-nowrap">{step.title}</p>
                </div>
                {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-navy-900 rotate-45"></div>}
              </div>
            );
          })}
        </div>

        {/* Form Content Area */}
        <div className="card-premium p-6 md:p-14 min-h-[50vh] relative shadow-2xl overflow-visible bg-[var(--bg-secondary)] backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="mt-14 pt-10 border-t border-[var(--border-primary)] flex flex-col md:flex-row justify-between gap-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary px-6 py-3 disabled:opacity-0 flex items-center gap-2 text-xs"
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            <div className="flex gap-4">
              {currentStep < steps.length ? (
                <div className="flex gap-4">
                  <button type="button" onClick={nextStep} className="btn-primary px-10 py-4 flex items-center gap-3 text-[10px] uppercase font-black tracking-[0.2em] shadow-xl">
                    Próximo <ChevronRight size={16} />
                  </button>
                  {currentStep === 9 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(10)}
                      className="bg-gold text-navy-900 px-6 py-4 rounded-xl flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] hover:bg-gold/90 transition-all shadow-lg"
                    >
                      Ver Proposta <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <button type="button" onClick={() => navigate('/admin')} className="btn-secondary px-6 py-4 text-[9px] uppercase font-black tracking-widest text-[var(--text-primary)]">
                    Sair
                  </button>
                  <button type="button" onClick={handleSave} className="bg-navy-900 text-white px-10 py-4 rounded-xl flex items-center gap-3 text-[10px] uppercase font-black tracking-[0.2em] hover:bg-navy-800 transition-all shadow-2xl active:scale-95 dark:border dark:border-gold/30">
                    Finalizar <CheckCircle2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
};

export default ClientOnboarding;

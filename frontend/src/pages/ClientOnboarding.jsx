import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Target, 
  Shield, 
  Briefcase, 
  CreditCard, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  CheckCircle2,
  Calendar,
  DollarSign,
  PieChart,
  Plus,
  Trash2,
  Menu,
  X,
  FileText
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const steps = [
  { id: 1, title: 'Identificação & Objetivos', icon: User },
  { id: 2, title: 'Planejamento & Proteções', icon: Shield },
  { id: 3, title: 'Aposentadoria & Investimentos', icon: Briefcase },
  { id: 4, title: 'Cartões & Canais de Renda', icon: CreditCard },
  { id: 5, title: 'Fluxo de Caixa (Gastos)', icon: DollarSign },
  { id: 6, title: 'Review & Realidade', icon: PieChart },
];

const ClientOnboarding = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    personal: { name: '', birthDate: '' },
    objectives: [
      { id: 'house', label: 'Imóvel próprio', selected: false, why: '' },
      { id: 'invest_property', label: 'Investimento imobiliário', selected: false, why: '' },
      { id: 'trips', label: 'Viagens', selected: false, why: '' },
      { id: 'retirement', label: 'Aposentadoria', selected: false, why: '' },
      { id: 'organization', label: 'Organização financeira', selected: false, why: '' },
      { id: 'educ_kids', label: 'Ajudar os filhos nos estudos', selected: false, why: '' },
      { id: 'investments', label: 'Investimentos', selected: false, why: '' },
      { id: 'car', label: 'Compra ou troca de carro', selected: false, why: '' },
    ],
    planning: { monthlyInvest: '', futureChanges: '', currentAssets: '' },
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
    }
  });

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
    } catch (err) {
      error('Falha ao sincronizar dados');
    }
  };

  const nextStep = () => currentStep < steps.length && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  // Calculations
  const calculatedTotals = useMemo(() => {
    const incomeTotal = parseFloat(data.cashFlow.salaries || 0) + parseFloat(data.cashFlow.otherIncome || 0);
    
    const fixedTotal = Object.entries(data.cashFlow.fixed)
      .filter(([key, v]) => key !== 'others' && (typeof v === 'string' || typeof v === 'number'))
      .reduce((sum, [_, v]) => sum + parseFloat(v || 0), 0) +
      (data.cashFlow.fixed.others?.reduce((sum, o) => sum + parseFloat(o.value || 0), 0) || 0);

    const variableTotal = Object.entries(data.cashFlow.variable)
      .filter(([key, v]) => key !== 'others' && (typeof v === 'string' || typeof v === 'number'))
      .reduce((sum, [_, v]) => sum + parseFloat(v || 0), 0) +
      (data.cashFlow.variable.others?.reduce((sum, o) => sum + parseFloat(o.value || 0), 0) || 0);

    const result = incomeTotal - fixedTotal - variableTotal;

    return { incomeTotal, fixedTotal, variableTotal, result };
  }, [data]);

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Nome Completo</label>
                <input 
                  type="text" 
                  value={data.personal.name} 
                  onChange={e => setData({...data, personal: {...data.personal, name: e.target.value}})}
                  className="input-premium font-bold" 
                  placeholder="Nome do Cliente"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 ml-2">Data de Nascimento</label>
                <input 
                  type="date" 
                  value={data.personal.birthDate} 
                  onChange={e => setData({...data, personal: {...data.personal, birthDate: e.target.value}})}
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
                          setData({...data, objectives: newObjs});
                        }}
                        className="w-5 h-5 rounded-lg border-2 border-slate-300 text-gold focus:ring-gold"
                      />
                      <span className="font-bold text-sm tracking-tight">{obj.label}</span>
                    </div>
                    {obj.selected && (
                      <textarea 
                        placeholder="Por que este objetivo é importante agora?"
                        value={obj.why}
                        onChange={e => {
                          const newObjs = [...data.objectives];
                          newObjs[idx].why = e.target.value;
                          setData({...data, objectives: newObjs});
                        }}
                        className="w-full bg-white/50 border border-gold/20 rounded-2xl p-4 text-xs outline-none focus:border-gold/50 h-20 resize-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="space-y-6">
              <label className="text-xs font-black uppercase text-gold tracking-widest px-2">Planejamento Financeiro</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Quanto investe mensalmente?</span>
                  <input type="text" value={data.planning.monthlyInvest} onChange={e => setData({...data, planning: {...data.planning, monthlyInvest: e.target.value}})} className="input-premium" placeholder="Ex: Cliente não poupa" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Mudança prevista (próximos meses)?</span>
                  <input type="text" value={data.planning.futureChanges} onChange={e => setData({...data, planning: {...data.planning, futureChanges: e.target.value}})} className="input-premium" placeholder="Ex: Aumento de salário" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Patrimônio Atual (Estimado)</span>
                <textarea value={data.planning.currentAssets} onChange={e => setData({...data, planning: {...data.planning, currentAssets: e.target.value}})} className="input-premium h-24" placeholder="Ex: Carro - FOX 2011 - 20.000,00" />
              </div>
            </div>

            <div className="space-y-6 border-t border-[var(--border-primary)] pt-10">
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
                    onClick={() => setData({...data, protections: {...data.protections, [prot.key]: !data.protections[prot.key]}})}
                    className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all ${data.protections[prot.key] ? 'border-green-500 bg-green-50/50 text-green-700' : 'border-[var(--border-primary)] bg-[var(--bg-primary)] text-slate-400'}`}
                  >
                    <span className="font-bold text-xs">{prot.label}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${data.protections[prot.key] ? 'border-green-500 bg-green-600' : 'border-slate-300'}`}>
                      {data.protections[prot.key] && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="Observações adicionais sobre proteções (valores, coberturas...)"
                value={data.protections.insuranceNotes}
                onChange={e => setData({...data, protections: {...data.protections, insuranceNotes: e.target.value}})}
                className="input-premium h-20"
              />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="bg-navy-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/10 rounded-full translate-y-1/2 translate-x-1/2 blur-2xl"></div>
               <h4 className="text-xl font-black italic mb-8 border-l-4 border-gold pl-4">Projeção de Aposentadoria</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/40">Idade pretendida</label>
                    <input type="number" value={data.retirement.age} onChange={e => setData({...data, retirement: {...data.retirement, age: e.target.value}})} className="bg-white/10 border-white/20 text-white w-full p-4 rounded-2xl outline-none focus:border-gold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/40">Renda mensal desejada</label>
                    <input type="text" value={data.retirement.desiredIncome} onChange={e => setData({...data, retirement: {...data.retirement, desiredIncome: e.target.value}})} className="bg-white/10 border-white/20 text-white w-full p-4 rounded-2xl outline-none focus:border-gold font-black" placeholder="R$ 0,00" />
                  </div>
               </div>
               <div className="mt-8 flex gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/40">Já poupa hoje?</label>
                    <div className="flex gap-2">
                       <button type="button" onClick={() => setData({...data, retirement: {...data.retirement, alreadySaving: true}})} className={`flex-1 py-3 rounded-xl font-bold text-xs ${data.retirement.alreadySaving ? 'bg-gold text-navy-900' : 'bg-white/10'}`}>Sim</button>
                       <button type="button" onClick={() => setData({...data, retirement: {...data.retirement, alreadySaving: false}})} className={`flex-1 py-3 rounded-xl font-bold text-xs ${!data.retirement.alreadySaving ? 'bg-gold text-navy-900' : 'bg-white/10'}`}>Não</button>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/40">Pretende usar INSS?</label>
                    <input type="text" value={data.retirement.onlyINSS} onChange={e => setData({...data, retirement: {...data.retirement, onlyINSS: e.target.value}})} className="bg-white/10 border-white/20 text-white w-full p-3 rounded-xl outline-none focus:border-gold text-xs" placeholder="Ex: Somente INSS" />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <label className="text-xs font-black uppercase text-gold tracking-widest px-2">Investimentos Atuais</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-400">Tipos de investimentos</label>
                   <input type="text" value={data.investments.types} onChange={e => setData({...data, investments: {...data.investments, types: e.target.value}})} className="input-premium text-sm" placeholder="Ex: CDB, Ações, FIIs" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-400">Perfil de risco</label>
                   <input type="text" value={data.investments.riskProfile} onChange={e => setData({...data, investments: {...data.investments, riskProfile: e.target.value}})} className="input-premium text-sm" placeholder="Ex: Moderado / Agressivo" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
             <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-black uppercase text-gold tracking-widest">Cartões de Crédito</label>
                <button 
                  type="button"
                  onClick={() => setData({...data, cards: { list: [...data.cards.list, { bank: '', annuity: 'Não', miles: 'Não', limit: '', monthlySpend: '' }] }})}
                  className="text-[10px] bg-gold/10 text-gold px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gold hover:text-white transition-all"
                >
                  <Plus size={14} /> Adicionar Cartão
                </button>
             </div>
             <div className="space-y-4">
                {data.cards.list.map((card, idx) => (
                  <div key={idx} className="card-premium p-6 relative group bg-white/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <input value={card.bank} onChange={e => {
                         const newList = [...data.cards.list];
                         newList[idx].bank = e.target.value;
                         setData({...data, cards: { list: newList }});
                       }} className="input-premium text-xs" placeholder="Qual cartão?" />
                       <input value={card.limit} onChange={e => {
                         const newList = [...data.cards.list];
                         newList[idx].limit = e.target.value;
                         setData({...data, cards: { list: newList }});
                       }} className="input-premium text-xs font-bold" placeholder="Limite (R$)" />
                       <input value={card.monthlySpend} onChange={e => {
                         const newList = [...data.cards.list];
                         newList[idx].monthlySpend = e.target.value;
                         setData({...data, cards: { list: newList }});
                       }} className="input-premium text-xs font-bold text-red-500" placeholder="Gasto médio" />
                       <div className="flex gap-2">
                         <input value={card.annuity} onChange={e => {
                           const newList = [...data.cards.list];
                           newList[idx].annuity = e.target.value;
                           setData({...data, cards: { list: newList }});
                         }} className="input-premium text-[10px] w-full" placeholder="Anuidade?" />
                         <button 
                            type="button"
                            onClick={() => {
                              const newList = data.cards.list.filter((_, i) => i !== idx);
                              setData({...data, cards: { list: newList }});
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

             <div className="space-y-6 pt-10 border-t border-[var(--border-primary)]">
               <label className="text-xs font-black uppercase text-gold tracking-widest px-2">Renda e Fluxo Mensal</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-400">Salário Líquido (Mensal)</label>
                   <input type="number" value={data.cashFlow.salaries} onChange={e => setData({...data, cashFlow: {...data.cashFlow, salaries: e.target.value}})} className="input-premium text-xl font-black text-green-600" placeholder="R$ 0,00" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-slate-400">Outras Rendas / Extras</label>
                   <input type="number" value={data.cashFlow.otherIncome} onChange={e => setData({...data, cashFlow: {...data.cashFlow, otherIncome: e.target.value}})} className="input-premium text-xl font-black text-green-500" placeholder="R$ 0,00" />
                 </div>
               </div>
             </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* FIXED EXPENSES */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-gold/20 pb-4">
                  <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center font-black">1</div>
                  <h4 className="text-sm font-black uppercase tracking-widest">Gastos Fixos Mensais</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {['housing', 'food', 'transport', 'health', 'energy', 'water', 'internet'].map(field => (
                     <div key={field} className="space-y-1">
                       <label className="text-[9px] uppercase font-bold text-slate-400 ml-1">{
                         field === 'housing' ? 'Moradia' : 
                         field === 'food' ? 'Alimentação' : 
                         field === 'transport' ? 'Transporte' : 
                         field === 'health' ? 'Saúde' :
                         field === 'energy' ? 'Energia' :
                         field === 'water' ? 'Água' : 'Internet'
                       }</label>
                       <input type="number" value={data.cashFlow.fixed[field]} onChange={e => setData({...data, cashFlow: {...data.cashFlow, fixed: {...data.cashFlow.fixed, [field]: e.target.value}}})} className="input-premium px-3 py-2 text-xs" />
                     </div>
                   ))}
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                      <span className="text-xs font-black uppercase text-slate-400">Outros Gastos Fixos</span>
                      <button type="button" onClick={() => setData({...data, cashFlow: {...data.cashFlow, fixed: {...data.cashFlow.fixed, others: [...(data.cashFlow.fixed.others || []), { label: '', value: '' }]}}})} className="text-[10px] text-gold font-bold">Adicionar +</button>
                   </div>
                   {(data.cashFlow.fixed.others || []).map((oth, idx) => (
                     <div key={idx} className="flex gap-2">
                        <input value={oth.label} onChange={e => {
                          const newOthers = [...data.cashFlow.fixed.others];
                          newOthers[idx].label = e.target.value;
                          setData({...data, cashFlow: {...data.cashFlow, fixed: {...data.cashFlow.fixed, others: newOthers}}});
                        }} className="input-premium text-[10px] flex-1" placeholder="Ex: Celular" />
                        <input type="number" value={oth.value} onChange={e => {
                          const newOthers = [...data.cashFlow.fixed.others];
                          newOthers[idx].value = e.target.value;
                          setData({...data, cashFlow: {...data.cashFlow, fixed: {...data.cashFlow.fixed, others: newOthers}}});
                        }} className="input-premium text-[10px] w-24" />
                        <button type="button" onClick={() => {
                          const newOthers = data.cashFlow.fixed.others.filter((_, i) => i !== idx);
                          setData({...data, cashFlow: {...data.cashFlow, fixed: {...data.cashFlow.fixed, others: newOthers}}});
                        }} className="text-red-400"><Trash2 size={14}/></button>
                     </div>
                   ))}
                </div>
              </div>

              {/* VARIABLE EXPENSES */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-gold/20 pb-4">
                  <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center font-black">2</div>
                  <h4 className="text-sm font-black uppercase tracking-widest">Gastos Variáveis / Lazer</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {['housing', 'food', 'transport', 'health'].map(field => (
                     <div key={field} className="space-y-1">
                       <label className="text-[9px] uppercase font-bold text-slate-400 ml-1">{
                         field === 'housing' ? 'Moradia' : 
                         field === 'food' ? 'Alimentação' : 
                         field === 'transport' ? 'Transporte' : 'Saúde'
                       }</label>
                       <input type="number" value={data.cashFlow.variable[field]} onChange={e => setData({...data, cashFlow: {...data.cashFlow, variable: {...data.cashFlow.variable, [field]: e.target.value}}})} className="input-premium px-3 py-2 text-xs" />
                     </div>
                   ))}
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                      <span className="text-xs font-black uppercase text-slate-400">Outros Variáveis</span>
                      <button type="button" onClick={() => setData({...data, cashFlow: {...data.cashFlow, variable: {...data.cashFlow.variable, others: [...(data.cashFlow.variable.others || []), { label: '', value: '' }]}}})} className="text-[10px] text-gold font-bold">Adicionar +</button>
                   </div>
                   {(data.cashFlow.variable.others || []).map((oth, idx) => (
                     <div key={idx} className="flex gap-2">
                        <input value={oth.label} onChange={e => {
                          const newOthers = [...data.cashFlow.variable.others];
                          newOthers[idx].label = e.target.value;
                          setData({...data, cashFlow: {...data.cashFlow, variable: {...data.cashFlow.variable, others: newOthers}}});
                        }} className="input-premium text-[10px] flex-1" placeholder="Ex: Spotify" />
                        <input type="number" value={oth.value} onChange={e => {
                          const newOthers = [...data.cashFlow.variable.others];
                          newOthers[idx].value = e.target.value;
                          setData({...data, cashFlow: {...data.cashFlow, variable: {...data.cashFlow.variable, others: newOthers}}});
                        }} className="input-premium text-[10px] w-24" />
                        <button type="button" onClick={() => {
                          const newOthers = data.cashFlow.variable.others.filter((_, i) => i !== idx);
                          setData({...data, cashFlow: {...data.cashFlow, variable: {...data.cashFlow.variable, others: newOthers}}});
                        }} className="text-red-400"><Trash2 size={14}/></button>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* REALIDADE ATUAL */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl space-y-6">
                   <h4 className="text-lg font-black italic border-l-4 border-navy-900 pl-4 uppercase tracking-tighter text-navy-900">Realidade Atual</h4>
                   <div className="space-y-4">
                      {[
                        { label: 'Receitas', val: calculatedTotals.incomeTotal, color: 'text-green-600', perc: 100 },
                        { label: 'Gastos Fixos', val: calculatedTotals.fixedTotal, color: 'text-red-600', perc: (calculatedTotals.fixedTotal / (calculatedTotals.incomeTotal || 1) * 100).toFixed(1) },
                        { label: 'Gastos Variáveis', val: calculatedTotals.variableTotal, color: 'text-orange-500', perc: (calculatedTotals.variableTotal / (calculatedTotals.incomeTotal || 1) * 100).toFixed(1) },
                        { label: 'Investimentos', val: 0, color: 'text-blue-500', perc: 0 },
                        { label: 'Resultado', val: calculatedTotals.result, color: 'text-navy-900 bg-slate-50 p-4 rounded-xl', perc: (calculatedTotals.result / (calculatedTotals.incomeTotal || 1) * 100).toFixed(1) },
                      ].map(item => (
                        <div key={item.label} className={`flex justify-between items-center ${item.label === 'Resultado' ? '' : 'pb-2 border-b border-slate-50'}`}>
                           <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                              <div className={`text-lg font-black ${item.color.includes('text-') ? item.color.split(' ')[0] : 'text-navy-900'}`}>R$ {Number(item.val).toLocaleString('pt-BR')}</div>
                           </div>
                           <div className="text-right text-xs font-bold text-slate-300 italic">{item.perc}%</div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* REALIDADE ESPERADA */}
                <div className="bg-navy-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden space-y-6">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
                   <h4 className="text-lg font-black italic border-l-4 border-gold pl-4 uppercase tracking-tighter text-white">Projeção Estratégica</h4>
                   <div className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-white/30">Receita Esperada</label>
                        <input type="number" value={data.cashFlow.expected.income} onChange={e => setData({...data, cashFlow: {...data.cashFlow, expected: {...data.cashFlow.expected, income: e.target.value}}})} className="bg-white/5 border-white/10 w-full p-4 rounded-2xl outline-none focus:border-gold font-black" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-black text-white/30">Meta Fixa (R$)</label>
                          <input type="number" value={data.cashFlow.expected.fixed} onChange={e => setData({...data, cashFlow: {...data.cashFlow, expected: {...data.cashFlow.expected, fixed: e.target.value}}})} className="bg-white/5 border-white/10 w-full p-4 rounded-2xl outline-none focus:border-gold font-black" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-black text-white/30">Meta Variável (R$)</label>
                          <input type="number" value={data.cashFlow.expected.variable} onChange={e => setData({...data, cashFlow: {...data.cashFlow, expected: {...data.cashFlow.expected, variable: e.target.value}}})} className="bg-white/5 border-white/10 w-full p-4 rounded-2xl outline-none focus:border-gold font-black" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-white/30">Meta Investimento (R$)</label>
                        <input type="number" value={data.cashFlow.expected.investments} onChange={e => setData({...data, cashFlow: {...data.cashFlow, expected: {...data.cashFlow.expected, investments: e.target.value}}})} className="bg-white/5 border-white/10 w-full p-4 rounded-2xl outline-none focus:border-gold font-black text-gold text-center text-xl" />
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-navy-900 text-gold">Carregando perfil estratégico...</div>;

  return (
    <SystemLayout>
      <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 mt-6">
           <div>
              <div onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gold text-xs font-black uppercase tracking-[0.3em] mb-4 cursor-pointer hover:translate-x-[-10px] transition-transform">
                <ChevronLeft size={16} /> Voltar ao Painel
              </div>
              <h1 className="text-4xl md:text-5xl font-black font-heading italic tracking-tighter text-navy-900 uppercase">
                Mapeamento <span className="text-gold italic">360°</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xl mt-2 tracking-tight">Análise profunda do ecossistema financeiro para o sócio <span className="text-navy-900 font-bold">{client?.name}</span>.</p>
           </div>
           <button 
            type="button"
            onClick={handleSave}
            className="btn-primary px-10 py-5 flex items-center gap-3 shadow-2xl shadow-gold/30 font-black text-lg transition-all active:scale-95"
           >
             <Save size={24} /> Salvar Evolução
           </button>
        </div>

        {/* Stepper Navigation */}
        <div className="flex flex-nowrap gap-4 mb-14 overflow-x-auto pb-6 scrollbar-hide">
           {steps.map((step) => {
             const Icon = step.icon;
             const active = currentStep === step.id;
             const completed = currentStep > step.id;
             return (
               <div 
                key={step.id} 
                onClick={() => setCurrentStep(step.id)}
                className={`flex-1 min-w-[200px] p-6 rounded-[2.5rem] flex items-center gap-4 cursor-pointer transition-all border-2 relative ${active ? 'bg-navy-900 text-white border-navy-900 scale-105 shadow-2xl' : completed ? 'bg-gold/10 text-gold border-gold/20' : 'bg-white text-slate-300 border-slate-50 opacity-60'}`}
               >
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${active ? 'bg-gold border-gold text-navy-900' : 'bg-slate-50 border-transparent'}`}>
                    {completed ? <CheckCircle2 size={24} className="text-green-600" /> : <Icon size={24} />}
                 </div>
                 <div className="block">
                    <p className={`text-[8px] uppercase font-black tracking-widest ${active ? 'text-gold' : 'text-slate-400'}`}>Etapa 0{step.id}</p>
                    <p className="text-xs font-black truncate leading-tight uppercase">{step.title}</p>
                 </div>
                 {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-navy-900 rotate-45"></div>}
               </div>
             );
           })}
        </div>

        {/* Form Content Area */}
        <div className="card-premium p-6 md:p-14 min-h-[60vh] relative shadow-2xl overflow-visible bg-white/80 backdrop-blur-xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
           
           <AnimatePresence mode="wait">
              {renderStep()}
           </AnimatePresence>

           <div className="mt-20 pt-10 border-t border-[var(--border-primary)] flex flex-col md:flex-row justify-between gap-6">
              <button 
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary px-8 py-4 disabled:opacity-0 flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Etapa Anterior
              </button>
              
              <div className="flex gap-4">
                {currentStep < steps.length ? (
                  <button type="button" onClick={nextStep} className="btn-primary px-10 py-5 flex items-center gap-3 text-[12px] uppercase font-black tracking-[0.3em] shadow-xl">
                    Próxima Etapa <ChevronRight size={18} />
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button type="button" onClick={() => navigate('/admin')} className="btn-secondary px-8 py-5 text-[10px] uppercase font-black tracking-widest">
                       Voltar ao Painel
                    </button>
                    <button type="button" onClick={handleSave} className="bg-navy-900 text-white px-12 py-5 rounded-[2rem] flex items-center gap-3 text-[12px] uppercase font-black tracking-[0.3em] hover:bg-navy-800 transition-all shadow-2xl active:scale-95">
                      Finalizar Mapeamento <CheckCircle2 size={18} />
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

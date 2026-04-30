import React, { memo } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';

const StrategicDashboard = ({ 
  dashboardData, 
  selectedYear, 
  theme, 
  stats, 
  formatCurrency 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Row 1: Evolução Patrimonial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-premium p-6 md:p-8 relative">
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp size={120} className="text-gold" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative z-20">
            <div className="flex items-center gap-2">
              <div>
                <h3 className="text-lg md:text-xl font-bold font-heading italic">Evolução Patrimonial</h3>
                <p className="text-[9px] md:text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Crescimento Líquido Acumulado</p>
              </div>
              <div className="group/tip relative">
                <Info size={12} className="text-gold cursor-help opacity-50" />
                <div className="absolute bottom-full right-0 sm:left-0 sm:right-auto mb-2 w-56 p-3 bg-navy-900 text-[11px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-[100] shadow-2xl border border-white/10 normal-case font-medium">
                  Cálculo Acumulado: Saldo Anterior + (Receitas - Despesas do mês). Mostra a variação real do seu patrimônio ao longo do ano.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full shrink-0">
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
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  width={65}
                  tickFormatter={formatCurrency}
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
                  formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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

      {/* Row 2: Provisionamento Anual */}
      <div className="card-premium p-6 md:p-8 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 relative z-20">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-lg md:text-xl font-bold font-heading">Provisionamento Anual</h3>
              <p className="text-[9px] md:text-[10px] uppercase font-black text-slate-400 tracking-widest">Fluxo projetado de Receitas vs Despesas</p>
            </div>
            <div className="group/tip relative">
              <Info size={12} className="text-gold cursor-help opacity-50" />
              <div className="absolute bottom-full right-0 sm:left-0 sm:right-auto mb-2 w-48 p-3 bg-navy-900 text-[11px] text-white rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-[100] shadow-2xl border border-white/10 normal-case font-medium">
                Exibe a tendência mensal de entradas e saídas, permitindo visualizar sazonalidades nos seus ganhos e gastos.
              </div>
            </div>
          </div>
          <div className="flex gap-4 bg-[var(--bg-primary)] px-4 py-2 rounded-full border border-[var(--border-primary)]">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-400" /> Receitas
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
              <div className="w-2 h-2 rounded-full bg-red-400" /> Despesas
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
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} width={65} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} width={65} tickFormatter={formatCurrency} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h3 className="text-lg md:text-xl font-bold font-heading">Comparativo de Fluxo Anual</h3>
            <p className="text-[9px] md:text-[10px] uppercase font-black text-slate-400 tracking-widest">Receitas vs Despesas (Mensal)</p>
          </div>
          <div className="flex gap-4 bg-[var(--bg-primary)] px-4 py-2 rounded-full border border-[var(--border-primary)] shrink-0">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Receitas
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
              <div className="w-2 h-2 rounded-full bg-red-500" /> Despesas
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.monthlyData} barGap={10}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} width={65} tickFormatter={formatCurrency} />
              <Tooltip
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Bar dataKey="receita" name="Receita" fill="#4ADE80" radius={[6, 6, 0, 0]} barSize={25} />
              <Bar dataKey="despesa" name="Despesa" fill="#F87171" radius={[6, 6, 0, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 md:p-12 rounded-[2.25rem] md:rounded-[3rem] text-center relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <TrendingUp className="text-gold mx-auto mb-6" size={48} />
        <h4 className="text-2xl font-black text-[var(--text-primary)] italic max-w-2xl mx-auto leading-tight">
          "O planejamento financeiro estratégico é a bússola que transforma objetivos em realidades tangíveis."
        </h4>
        <p className="text-gold text-xs font-black uppercase tracking-[0.3em] mt-6 font-bold">Inteligência Financeira 2BI</p>
      </div>
    </div>
  );
};

export default memo(StrategicDashboard);

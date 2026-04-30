import React, { memo } from 'react';
import { Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const MainCharts = ({ data, formatCurrency }) => {
  return (
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
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={65} tickFormatter={formatCurrency} />
            <Tooltip
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(MainCharts);

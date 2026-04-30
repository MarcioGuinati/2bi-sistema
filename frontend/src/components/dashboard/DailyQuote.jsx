import React, { useState, useEffect } from 'react';
import { Quote, ChevronDown, TrendingUp } from 'lucide-react';

const DailyQuote = () => {
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

  return (
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
  );
};

export default DailyQuote;

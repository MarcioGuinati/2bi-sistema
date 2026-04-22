import React from 'react';
import SystemLayout from '../components/SystemLayout';
import { motion } from 'framer-motion';
import { Calendar, Target, Zap, ChevronRight, ShieldCheck } from 'lucide-react';

const Mentoria = () => {
  return (
    <SystemLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        
        {/* PREMIUM HERO SECTION */}
        <div className="relative overflow-hidden rounded-[3rem] bg-navy-900 p-12 text-white border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/20 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full border border-gold/20 mb-6 group cursor-default">
                <Zap size={14} className="text-gold animate-pulse" />
                <span className="text-gold text-[10px] font-black uppercase tracking-[0.2em]">Sessão de Alto Impacto</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black font-heading leading-[1.1] mb-6 italic tracking-tight">
                Alinhamento <br/> <span className="text-gold">Estratégico 2BI.</span>
              </h1>
              
              <p className="text-slate-400 font-bold text-sm md:text-base leading-relaxed mb-8 max-w-md">
                Escolha o melhor horário para alinharmos sua estratégia <br className="hidden md:block" /> 
                <span className="text-white">rumo ao bilhão.</span> Foco em proteção patrimonial e <br />
                alavancagem de resultados consistentes.
              </p>

              <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gold/80">
                    <ShieldCheck size={16} /> 100% Confidencial
                 </div>
                 <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gold/80">
                    <Target size={16} /> Foco em ROI e Patrimônio
                 </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden md:flex justify-center"
            >
              <div className="relative">
                <div className="w-64 h-64 border-2 border-gold/20 rounded-[3rem] rotate-12 absolute inset-0 -z-10" />
                <div className="w-64 h-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] flex flex-col items-center justify-center p-8 gap-4 shadow-3xl">
                   <Calendar size={64} className="text-gold" />
                   <div className="text-center">
                     <div className="text-white font-black text-xs uppercase tracking-widest">Disponibilidade</div>
                     <div className="text-gold text-[10px] font-bold">Atualizado em Tempo Real</div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* WORKSTATION SCHEDULER */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          {/* Decorative container background for dark mode transition */}
          <div className="absolute -inset-4 bg-gold/5 rounded-[4rem] blur-2xl" />
          
          <div className="relative card-premium overflow-hidden min-h-[750px] border border-gold/20 shadow-2xl">
            {/* Control Bar Mockup */}
            <div className="bg-slate-100 dark:bg-navy-800 border-b border-[var(--border-primary)] p-4 flex items-center justify-between px-8">
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400 opacity-50" />
                 <div className="w-3 h-3 rounded-full bg-amber-400 opacity-50" />
                 <div className="w-3 h-3 rounded-full bg-green-400 opacity-50" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                 <Calendar size={14} className="text-gold" /> Google Workspace Integration
              </div>
              <div />
            </div>

            <div className="bg-white"> {/* Hard white bed to match Google Calendar native appearance */}
               <iframe 
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1Af9SGv5_3pZ4ZNYkwur4mbWBNFHIenWpyA3ntS0VuB8F-UzzKj2Wt3X0tk4NrJtHfwrQv7W2y?gv=true" 
                style={{ border: 0 }} 
                width="100%" 
                height="700" 
                frameBorder="0"
                title="Agenda Mentoria"
                className="w-full h-[700px]"
              ></iframe>
            </div>
          </div>

          {/* Footer Warning */}
          <p className="text-center mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
            * O agendamento é sincronizado instantaneamente com o Google Agenda.
          </p>
        </motion.div>
      </div>
    </SystemLayout>
  );
};

export default Mentoria;

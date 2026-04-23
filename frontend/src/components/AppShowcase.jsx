import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, BarChart3, Smartphone, Laptop, CheckCircle2, DollarSign } from 'lucide-react';

const AppShowcase = () => {
  return (
    <section id="app-showcase" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Text Content */}
          <div className="flex-1 order-2 lg:order-1 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="h-[2px] w-12 bg-gold" />
                <span className="text-gold uppercase tracking-[0.3em] text-sm font-black">
                  Inteligência a serviço do seu bolso
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-navy-900 font-heading mb-8 leading-[1.1] tracking-tight">
                Gestão <span className="text-gold italic">Automática</span> & Insights com IA.
              </h2>

              <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
                Diga adeus à digitação manual. Nossa plataforma <span className="text-navy-900 font-black">se conecta diretamente</span> ao seu banco e utiliza IA para guiar suas decisões.
              </p>

              <div className="space-y-6 mb-12">
                {[
                  { icon: ShieldCheck, title: "Importação Automática", desc: "Conexão direta com bancos para conciliação em tempo real de despesas e receitas." },
                  { icon: TrendingUp, title: "Insights de IA Conversacional", desc: "Uma assistente que analisa seus padrões e sugere economias via chat." },
                  { icon: BarChart3, title: "Mapeamento 360°", desc: "Visão completa do seu ecossistema financeiro em um único painel estratégico." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-all duration-300">
                      <item.icon className="text-gold group-hover:text-white transition-colors" size={24} />
                    </div>
                    <div>
                      <h4 className="text-navy-900 font-bold mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex items-center gap-2 text-navy-900 font-black italic">
                   <Smartphone size={20} className="text-gold" />
                   <p className="text-xs uppercase tracking-widest">Multi-plataforma</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden sm:block" />
                <div className="flex items-center gap-2 text-navy-900 font-black italic">
                   <CheckCircle2 size={20} className="text-green-500" />
                   <p className="text-xs uppercase tracking-widest">Conciliação Bancária</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Showcase - ANIMATED PHONE */}
          <div className="flex-1 order-1 lg:order-2 relative">
            <div className="relative mx-auto w-[280px] h-[580px] bg-navy-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden">
               {/* Phone Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50"></div>
               
               {/* App UI Simulation */}
               <div className="p-6 pt-10 space-y-6">
                  {/* AI Greeting */}
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-navy-900 animate-pulse">
                        <TrendingUp size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] text-white/40 uppercase font-black">Assistente 2BI</p>
                        <p className="text-xs text-white font-bold">Olá, seu resumo de hoje:</p>
                     </div>
                  </div>

                  {/* Transaction List with Animation */}
                  <div className="space-y-3">
                     <p className="text-[9px] uppercase font-black text-white/30 tracking-widest">Transações Recentes</p>
                     
                     {/* Row 1 - Static */}
                     <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center"><Smartphone size={14} className="text-blue-400" /></div>
                           <span className="text-[10px] text-white font-bold">Assinatura Digital</span>
                        </div>
                        <span className="text-[10px] text-red-500 font-black">- R$ 49,90</span>
                     </div>

                     {/* Row 2 - AUTOMATIC IMPORT ANIMATION */}
                     <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="bg-white/5 border border-gold/40 p-3 rounded-xl flex justify-between items-center relative overflow-hidden"
                     >
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center"><CheckCircle2 size={14} className="text-gold" /></div>
                           <div>
                              <span className="text-[10px] text-white font-bold block">Restaurante Gourmet</span>
                              <span className="text-[8px] text-gold uppercase font-black tracking-tighter">Importado do Banco</span>
                           </div>
                        </div>
                        <span className="text-[10px] text-red-500 font-black">- R$ 157,00</span>
                        <motion.div 
                           animate={{ x: ['100%', '-100%'] }}
                           transition={{ duration: 2, repeat: Infinity }}
                           className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent" 
                        />
                     </motion.div>

                     {/* Row 3 - INCOME */}
                     <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 2, duration: 0.5 }}
                        className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl flex justify-between items-center"
                     >
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center"><DollarSign size={14} className="text-green-400" /></div>
                           <span className="text-[10px] text-white font-bold">Recebimento Honorários</span>
                        </div>
                        <span className="text-[10px] text-green-500 font-black">+ R$ 4.500,00</span>
                     </motion.div>
                  </div>

                  {/* AI CHAT INSIGHT ANIMATION */}
                  <motion.div 
                     initial={{ y: 20, opacity: 0 }}
                     whileInView={{ y: 0, opacity: 1 }}
                     transition={{ delay: 3, duration: 0.7 }}
                     className="bg-gold p-4 rounded-2xl rounded-tl-none shadow-2xl relative"
                  >
                     <p className="text-[11px] font-black italic text-navy-900 leading-tight">
                        "Notei que você economizou 12% a mais este mês. Que tal aportar R$ 500 no seu objetivo 'Aposentadoria'?"
                     </p>
                     <div 
                        className="absolute -left-[10px] top-0 w-0 h-0" 
                        style={{
                          borderRight: '12px solid var(--color-gold)',
                          borderBottom: '12px solid transparent'
                        }}
                     ></div>
                     <div className="mt-2 flex gap-2">
                        <button className="bg-navy-900 text-white text-[8px] font-black px-3 py-1.5 rounded-full">Sim, agora!</button>
                        <button className="bg-white/20 text-navy-900 text-[8px] font-black px-3 py-1.5 rounded-full">Depois</button>
                     </div>
                  </motion.div>
               </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent -z-10 blur-3xl" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AppShowcase;

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  MessageCircle, 
  ChevronRight,
  Smartphone,
  Star,
  Users,
  CheckCircle2,
  Lock,
  Target,
  ArrowDownToLine,
  BrainCircuit,
  CalendarClock,
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const AppLandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const whatsappNumber = "5516992415924";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Olá! Visitei o site da 2BI e gostaria de saber mais sobre a mentoria e o aplicativo de gestão financeira.`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden selection:bg-gold selection:text-navy-900 font-sans ${
      theme === 'dark' ? 'bg-navy-900 text-white' : 'bg-slate-50 text-navy-900'
    }`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] backdrop-blur-xl border-b transition-all duration-500 ${
        theme === 'dark' ? 'bg-navy-900/90 border-white/5' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center text-center">
          <img src="/logo_2bi.png" alt="2BI" className="h-7 md:h-9 object-contain" />
          
          <div className="hidden lg:flex items-center gap-8">
            <a href="#diferenciais" className={`text-[10px] uppercase font-black tracking-widest transition-all ${
              theme === 'dark' ? 'text-white/60 hover:text-gold' : 'text-slate-500 hover:text-gold'
            }`}>Diferenciais</a>
            <a href="#tecnologia" className={`text-[10px] uppercase font-black tracking-widest transition-all ${
              theme === 'dark' ? 'text-white/60 hover:text-gold' : 'text-slate-500 hover:text-gold'
            }`}>Tecnologia</a>
            <a href="#planos" className={`text-[10px] uppercase font-black tracking-widest transition-all ${
              theme === 'dark' ? 'text-white/60 hover:text-gold' : 'text-slate-500 hover:text-gold'
            }`}>Mentoria</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${
                theme === 'dark' ? 'bg-white/5 text-gold hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a 
              href={whatsappUrl}
              target="_blank"
              className="bg-gold text-navy-900 px-5 md:px-7 py-2 md:py-3 rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/10"
            >
              Mentoria
            </a>
            <button className={`${theme === 'dark' ? 'text-white/60' : 'text-slate-400'} lg:hidden p-1`}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-gold/5 rounded-full blur-[100px] animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl mb-6 border ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gold/5 border-gold/10'
            }`}>
              <BrainCircuit size={14} className="text-gold" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-gold text-center">Inteligência Artificial Aplicada</span>
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black font-heading leading-[1.1] md:leading-tight mb-6 uppercase italic tracking-tighter ${
              theme === 'dark' ? 'text-white' : 'text-navy-900'
            }`}>
              Gestão de <br /><span className="text-gold">Alto Nível.</span>
            </h1>
            <p className={`text-sm md:text-base mb-10 leading-relaxed font-medium max-w-md mx-auto lg:mx-0 ${
              theme === 'dark' ? 'text-white/50' : 'text-slate-500'
            }`}>
              A ferramenta definitiva para quem não aceita menos que a excelência financeira. O seu patrimônio em uma nova dimensão.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a 
                href={whatsappUrl}
                className="w-full sm:w-auto bg-gold text-navy-900 px-8 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-navy-900 hover:text-white transition-all shadow-xl shadow-gold/10 active:scale-95"
              >
                Falar com Estrategista <ChevronRight size={18} />
              </a>
              <Link 
                to="/login"
                className={`w-full sm:w-auto border px-8 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center transition-all active:scale-95 ${
                  theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-navy-900 shadow-sm hover:bg-slate-50'
                }`}
              >
                Entrar no App
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-first lg:order-last mb-10 lg:mb-0"
          >
            <div className={`relative z-10 p-2 md:p-3 rounded-[2rem] md:rounded-[3rem] border backdrop-blur-sm mx-auto max-w-sm md:max-w-md ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-2xl'
            }`}>
              <img 
                src="/app/1.png" 
                alt="2BI App Screenshot" 
                className="w-full h-auto rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform hover:scale-[1.01] duration-700"
              />
            </div>
            {/* Decal element - hidden on mobile small screens */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className={`absolute -top-6 -right-6 border p-5 rounded-2xl shadow-2xl z-20 hidden xl:block ${
                theme === 'dark' ? 'bg-navy-900 border-white/10 text-white' : 'bg-white border-slate-100 text-navy-900'
              }`}
            >
               <TrendingUp className="text-gold mb-1.5" size={20} />
               <div className="text-xl font-black italic">+R$ 25.400</div>
               <div className={`text-[7px] font-black uppercase tracking-widest opacity-40 ${
                 theme === 'dark' ? 'text-white' : 'text-navy-900'
               }`}>Economia via IA</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Diferenciais Section */}
      <section id="diferenciais" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8 mb-16 text-center lg:text-left">
            <div className="max-w-xl">
              <h2 className={`text-3xl md:text-5xl font-black font-heading uppercase italic tracking-tighter leading-tight mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-navy-900'
              }`}>
                Tecnologia que <br /><span className="text-gold">Antecipa o Futuro.</span>
              </h2>
              <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${
                theme === 'dark' ? 'text-white/40' : 'text-slate-400'
              }`}>Diferenciais desenvolvidos para sua liberdade absoluta.</p>
            </div>
            <a href={whatsappUrl} className="text-gold font-black text-[10px] uppercase tracking-widest border-b border-gold/30 pb-1.5 hover:border-gold transition-all">Ver todos os recursos</a>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              { 
                icon: <BrainCircuit size={24} />, 
                title: "Insights com IA", 
                desc: "Análise imediata de cada despesa, identificando vazamentos financeiros." 
              },
              { 
                icon: <ArrowDownToLine size={24} />, 
                title: "Importação OFX", 
                desc: "Sincronize seus gastos bancários de forma instantânea e 100% segura." 
              },
              { 
                icon: <Target size={24} />, 
                title: "Metas Estratégicas", 
                desc: "Definição baseada em prioridades reais para seus sonhos e reserva." 
              },
              { 
                icon: <CalendarClock size={24} />, 
                title: "Longo Prazo", 
                desc: "Projeção patrimonial para 20 anos com base na sua capacidade real." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className={`group p-8 rounded-[2rem] border transition-all text-center lg:text-left ${
                  theme === 'dark' ? 'bg-navy-950/40 border-white/5 hover:border-gold/20' : 'bg-white border-slate-100 shadow-sm hover:border-gold/20'
                }`}
              >
                <div className="text-gold mb-6 flex justify-center lg:justify-start transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className={`text-base md:text-lg font-black uppercase italic tracking-tighter mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-navy-900'
                }`}>{feature.title}</h3>
                <p className={`text-[11px] md:text-xs leading-relaxed ${
                  theme === 'dark' ? 'text-white/40' : 'text-slate-500'
                }`}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="tecnologia" className={`py-20 px-6 transition-colors ${
        theme === 'dark' ? 'bg-white/[0.01]' : 'bg-gold/[0.02]'
      }`}>
        <div className="max-w-6xl mx-auto space-y-24 md:space-y-32">
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="/app/2.png" 
                alt="Metas Onboarding" 
                className={`relative z-10 rounded-[2rem] md:rounded-[2.5rem] border shadow-2xl max-w-xs md:max-w-md mx-auto ${
                  theme === 'dark' ? 'border-white/10' : 'border-slate-200'
                }`}
              />
            </motion.div>
            <div className="space-y-6 text-center lg:text-left">
              <span className="text-gold font-black text-[8px] md:text-[9px] uppercase tracking-[0.4em]">Estratégia de elite</span>
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black font-heading uppercase italic tracking-tighter leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-navy-900'
              }`}>
                A Regra <span className="text-gold">60/30/10</span> <br />no Automático.
              </h2>
              <p className={`text-sm md:text-base leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium ${
                theme === 'dark' ? 'text-white/50' : 'text-slate-500'
              }`}>
                O sistema divide sua receita instantaneamente: Gastos Fixos, Estilo de Vida e Investimentos. Organização que gera paz mental.
              </p>
              <ul className="space-y-3 inline-flex flex-col items-start lg:block text-left">
                {['Cálculo automático por perfil', 'Foco no longo prazo', 'Alertas de orçamento'].map((txt, i) => (
                  <li key={i} className={`flex items-center gap-3 text-[10px] md:text-[11px] font-bold uppercase tracking-tight ${
                    theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                  }`}>
                    <CheckCircle2 className="text-gold" size={14} /> {txt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
              <span className="text-gold font-black text-[8px] md:text-[9px] uppercase tracking-[0.4em]">Monitoramento</span>
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black font-heading uppercase italic tracking-tighter leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-navy-900'
              }`}>
                Seu Patrimônio, <br /><span className="text-gold">Sua Evolução.</span>
              </h2>
              <p className={`text-sm md:text-base leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium ${
                theme === 'dark' ? 'text-white/50' : 'text-slate-500'
              }`}>
                Visualize o crescimento real das suas economias com gráficos de alta precisão. Mantenha o foco no que realmente importa.
              </p>
              <a 
                href={whatsappUrl}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 border px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-gold hover:text-navy-900' : 'bg-white border-slate-200 text-navy-900 shadow-sm hover:bg-gold hover:text-navy-900'
                }`}
              >
                <MessageCircle size={18} /> Conversar com Mentor
              </a>
            </div>
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="order-1 lg:order-2"
            >
              <img 
                src="/app/3.png" 
                alt="Dashboard Charts" 
                className={`rounded-[2rem] md:rounded-[2.5rem] border shadow-2xl max-w-xs md:max-w-md mx-auto ${
                  theme === 'dark' ? 'border-white/10' : 'border-slate-200'
                }`}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing / WhatsApp CTA */}
      <section id="planos" className="py-24 px-6">
        <div className={`max-w-4xl mx-auto rounded-[2.5rem] md:rounded-[3rem] border p-10 md:p-16 text-center relative overflow-hidden shadow-2xl transition-all ${
          theme === 'dark' ? 'bg-gradient-to-br from-navy-900 to-black border-white/10' : 'bg-white border-slate-100'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full"></div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black font-heading uppercase italic tracking-tighter mb-6 leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-navy-900'
            }`}>
              O controle está a <br /><span className="text-gold">um clique.</span>
            </h2>
            <p className={`mb-10 text-xs md:text-sm font-medium max-w-xs md:max-w-md mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-white/40' : 'text-slate-500'
            }`}>
              Garanta sua vaga na mentoria exclusiva e tenha o App 2BI configurado por um especialista para seus objetivos.
            </p>
            
            <a 
              href={whatsappUrl}
              className="w-full sm:w-auto bg-gold text-navy-900 px-10 py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/20 inline-flex items-center justify-center gap-3"
            >
              <MessageCircle size={20} /> Solicitar Acesso
            </a>

            <div className={`mt-12 flex flex-wrap justify-center gap-6 md:gap-8 ${theme === 'dark' ? 'opacity-30' : 'opacity-60'}`}>
               <div className="flex items-center gap-2 font-black text-[8px] md:text-[9px] uppercase tracking-widest"><Smartphone size={14} /> Mobile App</div>
               <div className="flex items-center gap-2 font-black text-[8px] md:text-[9px] uppercase tracking-widest"><PieChart size={14} /> Real Time Stats</div>
               <div className="flex items-center gap-2 font-black text-[8px] md:text-[9px] uppercase tracking-widest"><ShieldCheck size={14} /> Bank Security</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 px-6 border-t transition-all ${
        theme === 'dark' ? 'border-white/5 opacity-40' : 'border-slate-200 bg-white'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img src="/logo_2bi.png" alt="2BI" className="h-8 md:h-10 mb-4" />
            <p className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px] ${
              theme === 'dark' ? 'text-white' : 'text-slate-500'
            }`}>Estratégia e Inteligência financeira para quem busca o extraordinário.</p>
          </div>
          <div className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-center ${
            theme === 'dark' ? 'text-white' : 'text-slate-400'
          }`}>
            © 2BI PLANEJAMENTO ESTRATÉGICO
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Bubble */}
      <motion.a 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        href={whatsappUrl}
        className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all z-[200] group"
      >
        <MessageCircle size={28} md:size={32} />
        <span className="hidden md:block absolute right-20 bg-white text-navy-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl pointer-events-none">
          Falar com Mentor
        </span>
      </motion.a>
    </div>
  );
};

export default AppLandingPage;

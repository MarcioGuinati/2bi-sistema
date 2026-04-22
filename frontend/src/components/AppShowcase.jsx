import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, BarChart3, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';

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
                  Controle total na palma da mão
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-navy-900 font-heading mb-8 leading-[1.1] tracking-tight">
                Controle melhor seus <span className="text-gold italic">gastos</span> e receitas.
              </h2>

              <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
                Uma consultoria do começo ao fim, com <span className="text-navy-900 font-black">controle total</span>. Nossa plataforma exclusiva transforma a complexidade financeira em decisões inteligentes e automáticas.
              </p>

              <div className="space-y-6 mb-12">
                {[
                  { icon: BarChart3, title: "Dashboards Estratégicos", desc: "Visualize seu patrimônio com métricas de BI avançadas." },
                  { icon: ShieldCheck, title: "Segurança de Nível Bancário", desc: "Seus dados protegidos com criptografia de ponta a ponta." },
                  { icon: TrendingUp, title: "Projeção de Longo Prazo", desc: "Simule cenários e planeje sua aposentadoria com precisão." }
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
                   <p className="text-xs uppercase tracking-widest">Acompanhamento Real</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Showcase */}
          <div className="flex-1 order-1 lg:order-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-10"
            >
              {/* Main Image Mockup */}
              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 blur-[100px] rounded-full -z-10" />
                <img 
                  src="/assets/2bi_app_mockup.png" 
                  alt="2BI App Preview" 
                  className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] rounded-[2rem]"
                />
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-6 md:-right-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 z-20 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400">Patrimônio</p>
                  <p className="text-lg font-black text-navy-900">+12.4%</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 md:-left-10 bg-navy-900 p-6 rounded-3xl shadow-2xl border border-white/10 z-20 flex items-center gap-4 text-white"
              >
                <div className="w-10 h-10 bg-gold text-navy-900 rounded-full flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gold/60">Controle App</p>
                  <p className="text-lg font-black italic">Tudo em Um</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Background pattern */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-slate-50 via-transparent to-transparent -z-20 opacity-50" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AppShowcase;

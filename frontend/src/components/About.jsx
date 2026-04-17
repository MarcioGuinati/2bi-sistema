import { motion } from 'framer-motion';
import { Target, TrendingUp, Users2 } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/5] bg-navy-900 flex items-center justify-center p-12 text-center border-b-8 border-gold">
                <div>
                    <h3 className="text-white text-6xl font-bold mb-4">2BI</h3>
                    <p className="text-gold text-lg uppercase tracking-widest font-semibold mb-8">O Significado</p>
                    <div className="space-y-6 text-left border-t border-white/10 pt-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                                <span className="text-gold font-bold">2</span>
                            </div>
                            <p className="text-slate-300 text-sm">Dois irmãos unidos pela missão de transformar vidas através da proximidade e do atendimento humano.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                                <span className="text-gold font-bold italic">BI</span>
                            </div>
                            <p className="text-slate-300 text-sm">A visão do bilhão. Ambicionamos o crescimento, a prosperidade e a evolução financeira de nossos clientes.</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gold/10 rounded-full blur-2xl -z-1" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-gold uppercase tracking-[0.2em] text-sm font-bold mb-4">Nossa Essência</h2>
            <h3 className="text-4xl md:text-5xl mb-6 leading-tight">Uma parceria familiar com <span className="text-gold">visão institucional.</span></h3>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              A **2BI Planejamento** nasceu da união de dois propósitos: a clareza técnica e o acolhimento humano. Acreditamos que o planejamento financeiro não é apenas sobre números, mas sobre a liberdade que eles proporcionam.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center text-gold">
                  <Target size={24} />
                </div>
                <h4 className="text-xl font-bold">Estratégia</h4>
                <p className="text-slate-500 text-sm">Métodos testados para garantir que cada centavo trabalhe para o seu futuro.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                  <TrendingUp size={24} />
                </div>
                <h4 className="text-xl font-bold">Crescimento</h4>
                <p className="text-slate-500 text-sm">Foco absoluto na construção de patrimônio e prosperidade a longo prazo.</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-gold italic text-navy-800">
              "Nosso objetivo é tirar você do operacional das contas mensais para o estratégico da construção do seu primeiro bilhão, passo a passo."
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;

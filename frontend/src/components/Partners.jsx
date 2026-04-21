import { motion } from 'framer-motion';
import { User, ShieldCheck, Cpu, HeartHandshake } from 'lucide-react';

const Partners = () => {
  return (
    <section id="partners" className="py-24 bg-navy-900 text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-9xl font-bold">2</div>
        <div className="absolute bottom-10 right-10 text-9xl font-bold">BI</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold uppercase tracking-widest text-sm font-bold mb-4"
          >
            Fundadores
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading mb-6"
          >
            A força da <span className="text-gold italic">União Familiar</span> e Estratégia.
          </motion.h3>
          <p className="max-w-2xl mx-auto text-slate-400">
            Dois irmãos, duas especialidades, uma única missão. A 2BI combina o calor do atendimento humano com a frieza dos números e processos digitais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Partner 1 */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative group"
          >
            <div className="absolute top-8 right-8 text-gold opacity-20 group-hover:opacity-100 transition-opacity">
              <HeartHandshake size={48} />
            </div>
            <div className="w-20 h-20 bg-gold rounded-full mb-8 flex items-center justify-center text-navy-900">
              <User size={40} />
            </div>
            <h4 className="text-3xl font-bold mb-2 text-white">Especialista em Pessoas</h4>
            <p className="text-gold font-medium mb-6">Consultoria, Relacionamento e Estratégia</p>
            <p className="text-slate-400 leading-relaxed mb-6">
              Responsável por traduzir o caos financeiro em metas claras. Com foco no atendimento humano e na orientação personalizada, garante que cada cliente sinta segurança em cada decisão.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck size={16} className="text-gold" /> Orientação de Investimentos
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck size={16} className="text-gold" /> Proteção Patrimonial
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck size={16} className="text-gold" /> Mentoria Individual
              </li>
            </ul>
          </motion.div>

          {/* Partner 2 */}
          <motion.div
            whileHover={{ y: -10 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative group"
          >
            <div className="absolute top-8 right-8 text-gold opacity-20 group-hover:opacity-100 transition-opacity">
              <Cpu size={48} />
            </div>
            <div className="w-20 h-20 bg-gold rounded-full mb-8 flex items-center justify-center text-navy-900">
              <User size={40} />
            </div>
            <h4 className="text-3xl font-bold mb-2 text-white">Arquiteto de Processos</h4>
            <p className="text-gold font-medium mb-6">Sistemas, Estrutura Digital e Processos</p>
            <p className="text-slate-400 leading-relaxed mb-6">
              O cérebro por trás da eficiência. Responsável por garantir que a tecnologia trabalhe a favor do cliente, automatizando controles e criando uma estrutura digital robusta para o crescimento.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck size={16} className="text-gold" /> Estrutura de BI e Dados
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck size={16} className="text-gold" /> Automação Financeira
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck size={16} className="text-gold" /> Otimização de Experiência
              </li>
            </ul>
          </motion.div>

        </div>

        <div className="mt-20 text-center">
            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-transparent via-gold/50 to-transparent w-full max-w-lg mb-8" />
            <p className="text-slate-500 italic max-w-xl mx-auto">
              "Juntos, formamos um ecossistema completo: a empatia necessária para ouvir seus sonhos e a precisão técnica necessária para realizá-los."
            </p>
        </div>
      </div>
    </section>
  );
};

export default Partners;

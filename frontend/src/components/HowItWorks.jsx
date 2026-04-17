import { motion } from 'framer-motion';

const steps = [
  {
    number: "01",
    title: "Diagnóstico Inicial",
    desc: "Analisamos sua situação atual, dívidas, renda e seus maiores sonhos financeiros."
  },
  {
    number: "02",
    title: "Definição de Metas",
    desc: "Estabelecemos objetivos claros de curto, médio e longo prazo com prazos reais."
  },
  {
    number: "03",
    title: "Estratégia Customizada",
    desc: "Criamos o 'mapa da mina' exclusivo para você, focando em eficiência e crescimento."
  },
  {
    number: "04",
    title: "Implementação",
    desc: "Colocamos o plano em ação com Ferramentas de BI e suporte direto dos sócios."
  },
  {
    number: "05",
    title: "Acompanhamento",
    desc: "Reuniões periódicas para ajustar o curso e garantir que você chegue ao destino."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-gold uppercase tracking-widest text-sm font-bold mb-4">Metodologia 2BI</h2>
          <h3 className="text-4xl md:text-5xl font-heading mb-6">Sua jornada para a <span className="text-gold">liberdade financeira.</span></h3>
          <p className="max-w-2xl mx-auto text-slate-500">
            Um processo estruturado, digital e humano para que você nunca mais se sinta perdido em relação ao seu dinheiro.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[2.5rem] left-0 w-full h-[2px] bg-slate-100 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 bg-white border-4 border-slate-50 shadow-xl rounded-full flex items-center justify-center mb-6 group-hover:border-gold transition-colors duration-500">
                  <span className="text-navy-900 text-3xl font-black">{step.number}</span>
                </div>
                <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-navy-900 text-white text-center">
            <p className="text-lg">Pronto para dar o primeiro passo? <a href="#contact" className="text-gold font-bold underline ml-2 hover:text-gold-500 transition-colors">Agende seu diagnóstico gratuito agora.</a></p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

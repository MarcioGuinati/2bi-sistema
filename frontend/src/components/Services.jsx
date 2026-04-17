import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Wallet, 
  ShieldCheck, 
  PieChart, 
  TrendingUp, 
  CalendarCheck,
  Building2
} from 'lucide-react';

const services = [
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Consultoria Financeira",
    description: "Diagnóstico profundo e recomendações personalizadas para sua realidade atual."
  },
  {
    icon: <Wallet className="w-8 h-8" />,
    title: "Organização Mensal",
    description: "Controle de fluxo de caixa e otimização de gastos para gerar economia real."
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Proteção Patrimonial",
    description: "Seguros e estratégias jurídicas para proteger tudo o que você construiu."
  },
  {
    icon: <PieChart className="w-8 h-8" />,
    title: "Orientação para Investimentos",
    description: "Clareza sobre onde alocar seu capital com base nos seus objetivos de vida."
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Acompanhamento Estratégico",
    description: "Monitoramento contínuo e ajustes de rota para manter o crescimento consistente."
  },
  {
    icon: <CalendarCheck className="w-8 h-8" />,
    title: "Planejamento de Longo Prazo",
    description: "Construção de metas para aposentadoria, educação dos filhos e sucessão."
  }
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-gold uppercase tracking-widest text-sm font-bold mb-4">Nossas Soluções</h2>
            <h3 className="text-4xl md:text-5xl">Estratégias sob medida para cada <span className="text-gold">fase da sua vida.</span></h3>
          </div>
          <div className="hidden md:block">
             <a href="#contact" className="btn-secondary">Ver todos os serviços</a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-navy-900 text-gold rounded-2xl flex items-center justify-center mb-6">
                {service.icon}
              </div>
              <h4 className="text-2xl font-bold mb-4">{service.title}</h4>
              <p className="text-slate-600 leading-relaxed mb-6">
                {service.description}
              </p>
              <a href="#contact" className="text-gold font-bold flex items-center gap-2 group">
                Saiba mais <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center md:hidden">
            <a href="#contact" className="btn-secondary w-full">Ver todos os serviços</a>
        </div>
      </div>
    </section>
  );
};

const ArrowRight = ({ size, className }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);

export default Services;

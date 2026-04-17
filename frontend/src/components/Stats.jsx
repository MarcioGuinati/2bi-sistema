import { motion } from 'framer-motion';

const stats = [
  { value: "100+", label: "Famílias Impactadas", suffix: "" },
  { value: "R$ 50M+", label: "Patrimônio Protegido", suffix: "" },
  { value: "100%", label: "Foco em Transparência", suffix: "" },
  { value: "24/7", label: "Monitoramento Digital", suffix: "" },
];

const Stats = () => {
  return (
    <section className="py-20 bg-navy-800 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-gold mb-2">{stat.value}</div>
              <div className="text-slate-400 text-sm uppercase tracking-widest font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;

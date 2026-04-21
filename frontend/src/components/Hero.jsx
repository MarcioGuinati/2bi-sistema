import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Calendar } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-navy-900">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/hero-bg.png" 
          alt="2BI Background" 
          className="w-full h-full object-cover opacity-30 grayscale-[50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="h-[2px] w-12 bg-gold" />
              <span className="text-gold uppercase tracking-[0.3em] text-sm font-semibold">
                Excelência em Planejamento
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 leading-[1.1]">
              Do Caos à <br />
              <span className="text-gold italic">Prosperidade</span> Consistente.
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
              Planejamento financeiro com <span className="text-white font-medium">visão, estratégia e parceria</span> para transformar sua vida financeira e proteger seu legado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <motion.a 
                href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1Af9SGv5_3pZ4ZNYkwur4mbWBNFHIenWpyA3ntS0VuB8F-UzzKj2Wt3X0tk4NrJtHfwrQv7W2y?gv=true"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center justify-center gap-2 min-h-[56px] px-8"
              >
                <Calendar size={20} />
                Agendar Reunião
              </motion.a>

              <motion.a 
                href="https://wa.me/5516992415924"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center justify-center gap-2 bg-white/5 border-white/20 text-white min-h-[56px] px-8"
              >
                <MessageCircle size={20} className="text-gold" />
                Falar no WhatsApp
              </motion.a>
            </div>

            <div className="mt-12 flex items-center gap-8 grayscale opacity-50">
              <div className="flex flex-col">
                <span className="text-white text-2xl font-bold">2 Brothers</span>
                <span className="text-xs text-gold uppercase tracking-tighter">União e Confiança</span>
              </div>
              <div className="h-8 w-[1px] bg-white/20" />
              <div className="flex flex-col">
                <span className="text-white text-2xl font-bold">BI Strategy</span>
                <span className="text-xs text-gold uppercase tracking-tighter">Foco no Crescimento</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl z-0"
      />
    </section>
  );
};

export default Hero;

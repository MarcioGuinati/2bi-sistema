import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          
          {/* Contact Info Sidebar */}
          <div className="lg:w-1/3 bg-gold p-12 md:p-16 text-navy-900">
            <h3 className="text-3xl font-bold mb-8">Vamos construir sua prosperidade?</h3>
            <p className="mb-10 text-navy-800/80 leading-relaxed font-medium">
                Agende uma conversa inicial para entendermos como a **2BI Planejamento** pode acelerar seus resultados.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-900/10 flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-900/10 flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <span>contato@2biplanning.com.br</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-900/10 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
                <motion.a 
                    whileHover={{ scale: 1.1 }}
                    href="#" 
                    className="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center"
                >
                    <MessageCircle size={20} />
                </motion.a>
                {/* Social icons placeholder */}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3 p-12 md:p-16 bg-navy-900 text-white">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gold font-bold">Nome Completo</label>
                  <input 
                    type="text" 
                    placeholder="Seu nome"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-gold outline-none transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gold font-bold">E-mail</label>
                  <input 
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-gold outline-none transition-all placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gold font-bold">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-gold outline-none transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gold font-bold">Objetivo Principal</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-gold outline-none transition-all text-white/60">
                    <option value="">Selecione um objetivo</option>
                    <option value="organizar">Organização Financeira</option>
                    <option value="investir">Começar a Investir</option>
                    <option value="patrimonio">Proteção de Patrimônio</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gold font-bold">Mensagem</label>
                <textarea 
                  rows="4"
                  placeholder="Conte um pouco sobre como podemos te ajudar..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-gold outline-none transition-all placeholder:text-white/20"
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3"
              >
                Enviar Solicitação <Send size={20} />
              </motion.button>
              
              <p className="text-center text-white/30 text-xs">
                Respeitamos sua privacidade. Seus dados estão protegidos por sigilo profissional.
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;

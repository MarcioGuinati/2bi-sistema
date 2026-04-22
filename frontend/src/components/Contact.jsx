import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    objective: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/register-lead', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', objective: '', message: '' });
      
      // Reset success state after a while
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting lead:', err);
      setError(err.response?.data?.error || 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative">
          
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-navy-900/95 flex flex-col items-center justify-center text-center p-12 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(212,175,55,0.4)]"
                >
                  <CheckCircle2 size={48} className="text-navy-900" />
                </motion.div>
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-black text-white italic mb-4"
                >
                  Solicitação Recebida!
                </motion.h3>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-300 max-w-md mx-auto leading-relaxed"
                >
                  Seu perfil estratégico foi criado com sucesso. Nossa equipe entrará em contato em breve para os próximos passos.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={() => setSuccess(false)}
                  className="mt-10 text-gold text-xs font-black uppercase tracking-widest hover:underline"
                >
                  Voltar ao formulário
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contact Info Sidebar */}
          <div className="lg:w-1/3 bg-gold p-12 md:p-16 text-navy-900">
            <h3 className="text-3xl font-bold mb-8">Vamos construir sua prosperidade?</h3>
            <p className="mb-10 text-navy-800/80 leading-relaxed font-medium">
              Agende uma conversa inicial para entendermos como a **2BI Planejamento** pode acelerar seus resultados.
            </p>

            <div className="space-y-6 text-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-900/10 flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <span className="font-bold">(16) 99241-5924</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-900/10 flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <span className="font-bold">contato@2biplanning.com.br</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-navy-900/10 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <span className="font-bold">Franca, SP - Brasil</span>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://wa.me/5516992415924"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center"
              >
                <MessageCircle size={20} />
              </motion.a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3 p-12 md:p-16 bg-navy-900 text-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gold font-bold">Nome Completo</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    className="input-premium text-[var(--text-primary)] placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gold font-bold">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="input-premium text-[var(--text-primary)] placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gold font-bold">Telefone / WhatsApp</label>
                  <input
                    id="phone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="input-premium text-[var(--text-primary)] placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gold font-bold">Objetivo Principal</label>
                  <select 
                    id="objective"
                    required
                    value={formData.objective}
                    onChange={handleChange}
                    className="select-premium text-[var(--text-primary)]"
                  >
                    <option value="" className="bg-white text-navy-900">Selecione um objetivo</option>
                    <option value="Organização Financeira" className="bg-white text-navy-900">Organização Financeira</option>
                    <option value="Começar a Investir" className="bg-white text-navy-900">Começar a Investir</option>
                    <option value="Proteção de Patrimônio" className="bg-white text-navy-900">Proteção de Patrimônio</option>
                    <option value="Outros" className="bg-white text-navy-900">Outros</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gold font-bold">Mensagem</label>
                <textarea
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Conte um pouco sobre como podemos te ajudar..."
                  className="input-premium resize-none text-[var(--text-primary)] placeholder:text-slate-400"
                ></textarea>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Enviar Solicitação'} <Send size={20} />
              </motion.button>

              <p className="text-center text-white/30 text-xs font-medium">
                Ao enviar, seu perfil será pré-cadastrado em nosso sistema de consultoria.
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import heroImage from '../assets/login-hero.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/panel'); 
    } catch (err) {
      setError('Credenciais inválidas. Verifique seus dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex overflow-hidden">
      {/* LEFT SIDE - VISUAL HERO */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-navy-900 border-r border-gold/20">
        <img 
            src={heroImage} 
            alt="Financial Planning" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110 blur-[1px]"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-900 via-navy-900/40 to-transparent"></div>
        
        {/* Glassmorphism Content Box */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 m-20 self-end p-10 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl max-w-lg"
        >
            <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center text-navy-900 font-black text-2xl shadow-xl shadow-gold/20 mb-8">
                2BI
            </div>
            <h2 className="text-4xl font-black text-white italic leading-tight tracking-tighter mb-4">
                Estratégia e Inteligência <br/> <span className="text-gold">Financeira Aplicada.</span>
            </h2>
            <p className="text-white/60 font-medium text-sm leading-relaxed mb-8">
                Bem-vindo ao centro de operações da 2BI Planejamento. 
                Aqui, transformamos dados em decisões e metas em realidade patrimonial.
            </p>
            <div className="flex gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-gold italic">Data-Driven</div>
                <div className="bg-white/10 px-4 py-2 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-gold italic">Patrimonial</div>
            </div>
        </motion.div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-[var(--bg-primary)] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-gold/20 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-4 h-4 bg-navy-900/5 rounded-full"></div>

        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md w-full"
        >
            {/* BRANDING MOBILE */}
            <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
                 <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center font-black text-navy-900 text-xl shadow-lg">2BI</div>
                 <div className="flex flex-col">
                    <span className="text-navy-900 font-black tracking-tighter text-lg leading-none">PLANEJAMENTO</span>
                    <span className="text-gold text-[8px] font-black uppercase tracking-widest font-heading">Estratégia Financeira</span>
                 </div>
            </div>

            <div className="mb-12">
                <h3 className="text-3xl font-black text-[var(--text-primary)] font-heading tracking-tight italic">Portal de Acesso</h3>
                <p className="text-[var(--text-secondary)] font-bold text-sm mt-2">Identifique-se para gerenciar seus ativos.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 text-red-600 p-5 rounded-3xl text-xs font-black uppercase tracking-widest border border-red-100 flex items-center gap-3"
                    >
                        <Shield size={18} /> {error}
                    </motion.div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-2 tracking-widest">Endereço de E-mail</label>
                    <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold transition-colors" size={20} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl pl-14 pr-6 py-5 focus:border-gold outline-none transition-all shadow-sm font-semibold text-[var(--text-primary)]"
                            placeholder="seu@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Senha de Acesso</label>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold transition-colors" size={20} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl pl-14 pr-6 py-5 focus:border-gold outline-none transition-all shadow-sm font-semibold text-[var(--text-primary)]"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-900 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gold hover:text-navy-900 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98]"
                >
                    {loading ? 'Validando Acesso...' : 'Autenticar com Segurança'}
                    {!loading && <ArrowRight size={20} />}
                </button>
            </form>

            <div className="mt-12 pt-8 border-t border-[var(--border-primary)] text-center">
                <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest">
                    Grupo 2BI Planejamento <br/> 
                    <span className="text-gold">© 2026 Todos os direitos reservados</span>
                </p>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

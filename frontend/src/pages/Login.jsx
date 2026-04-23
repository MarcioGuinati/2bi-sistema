import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, Smartphone, TrendingUp, Zap } from 'lucide-react';
import heroImage from '../assets/login-hero-premium.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-slide every 6 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-[var(--bg-primary)] flex overflow-hidden font-sans">
      {/* LEFT SIDE - VISUAL HERO WITH SLIDER */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-navy-900">
        <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
        >
            <img 
                src={heroImage} 
                alt="Financial Planning" 
                className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent"></div>
            <div className="absolute inset-0 bg-navy-900/20 backdrop-grayscale-[30%]"></div>
        </motion.div>
        
        <div className="relative z-10 flex flex-col justify-between h-full p-20 w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <img 
                    src="/logo_2bi.png" 
                    alt="2BI Planejamento" 
                    className="w-40 h-auto filter brightness-0 invert"
                />
            </motion.div>

            {/* SLIDER CONTENT */}
            <div className="relative h-[480px] flex flex-col justify-center">
                {currentSlide === 0 ? (
                    <div className="flex items-center gap-12">
                        <motion.div 
                            key="slide-app"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-md shrink-0"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-navy-900">
                                    <Smartphone size={20} />
                                </div>
                                <span className="text-gold font-black uppercase tracking-[0.3em] text-xs">Exclusividade Mobile</span>
                            </div>
                            <h2 className="text-5xl font-black text-white italic leading-[1] tracking-tighter mb-8">
                                Seu Patrimônio na <br/> <span className="text-gold">Palma da Mão.</span>
                            </h2>
                            
                            <div className="space-y-4 text-white/80">
                                <p className="text-sm font-medium leading-relaxed">
                                    Experiência conectada com <span className="text-gold font-bold">Importação Automática</span> e análise de gastos guiada por Inteligência Artificial.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/60">Open Banking</span>
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/60">IA Generativa</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* MINI APP ANIMATION */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            className="relative hidden xl:block w-[200px] h-[400px] bg-navy-950 rounded-[2.2rem] border-[6px] border-white/10 shadow-3xl overflow-hidden"
                        >
                            <div className="p-4 pt-8 space-y-4">
                                <div className="h-1.5 w-12 bg-white/10 rounded-full mx-auto mb-6" />
                                <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
                                <motion.div 
                                    animate={{ 
                                        opacity: [0, 1, 1, 0],
                                        y: [10, 0, 0, -10]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="bg-gold/10 border border-gold/40 p-2 rounded-xl flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gold/20 rounded flex items-center justify-center"><Zap size={10} className="text-gold" /></div>
                                        <span className="text-[7px] text-white font-bold">Posto de Gasolina</span>
                                    </div>
                                    <span className="text-[7px] text-red-500 font-black">- 185,00</span>
                                </motion.div>
                                <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
                                <motion.div 
                                    animate={{ 
                                        scale: [0.95, 1, 1, 0.95],
                                        opacity: [0, 1, 1, 0],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                    className="bg-gold p-3 rounded-xl rounded-tl-none mt-4"
                                >
                                    <p className="text-[8px] font-black italic text-navy-900 leading-tight">
                                        "Seus gastos com lazer subiram 10%. Posso sugerir um ajuste?"
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <motion.div 
                        key="slide-architecture"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-5xl md:text-7xl font-black text-white italic leading-[1] tracking-tighter mb-8">
                            Arquitetura <br/> <span className="text-gold">Patrimonial</span> de <br/> Precisão Digital.
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="space-y-2 border-l-2 border-gold/40 pl-6">
                                <p className="text-white text-2xl font-black italic">R$ 5Bi+</p>
                                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Ativos Sob Estratégia</p>
                            </div>
                            <div className="space-y-2 border-l-2 border-gold/40 pl-6">
                                <p className="text-white text-2xl font-black italic">100%</p>
                                <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Foco em Resultados</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Slider Indicators */}
                <div className="flex gap-3 mt-12">
                    <button 
                        onClick={() => setCurrentSlide(0)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === 0 ? 'w-16 bg-gold' : 'w-4 bg-white/20'}`}
                    ></button>
                    <button 
                        onClick={() => setCurrentSlide(1)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === 1 ? 'w-16 bg-gold' : 'w-4 bg-white/20'}`}
                    ></button>
                </div>
            </div>

            <div className="text-white/30 text-[10px] font-bold tracking-[0.5em] uppercase">
                Member of 2BI Financial Group Network
            </div>
        </div>

        {/* Floating Light Flare */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[150px] -z-0"></div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 lg:p-24 bg-[var(--bg-primary)] relative">
        {/* Subtle texture or pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-md w-full relative z-10"
        >
            <div className="lg:hidden flex justify-center mb-12">
                 <img src="/logo_2bi.png" alt="2BI" className="w-32 h-auto" />
            </div>

            <div className="mb-10 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Ambiente Seguro</span>
                </div>
                <h3 className="text-4xl font-black text-navy-900 font-heading tracking-tighter italic">Autenticação</h3>
                <p className="text-slate-400 font-semibold text-sm mt-1">Conecte-se para gerenciar seus ativos de alto valor.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black uppercase tracking-wider border border-red-100 flex items-center gap-3"
                    >
                        <Shield size={16} /> {error}
                    </motion.div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400 ml-4 tracking-[0.2em]">Identificação</label>
                    <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold transition-colors" size={18} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] pl-16 pr-6 py-5 focus:border-gold outline-none transition-all shadow-sm font-bold text-navy-900"
                            placeholder="E-mail ou ID de Usuário"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-4">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Senha Criptografada</label>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-gold transition-colors" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] pl-16 pr-16 py-5 focus:border-gold outline-none transition-all shadow-sm font-bold text-navy-900"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-gold transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 text-[11px]">
                    <label className="flex items-center gap-2 text-slate-500 font-bold cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-gold focus:ring-gold transition-all" />
                        Lembrar neste dispositivo
                    </label>
                    <button type="button" className="text-navy-900 font-black uppercase tracking-widest hover:text-gold transition-colors">Solicitar Nova Senha</button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-900 text-white !py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-gold hover:text-navy-900 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-70 group"
                >
                    {loading ? 'Sincronizando...' : 'Acessar Workspace'}
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <ArrowRight size={20} />
                    </motion.div>
                </button>
            </form>

            <div className="mt-16 text-center">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-[0.3em]">Criptografia de Ponta a Ponta</span>
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                </div>
                
                <div className="flex justify-center gap-8 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                    <div className="flex flex-col items-center gap-1">
                        <Shield size={24} className="text-navy-900" />
                        <span className="text-[8px] font-black">256-BIT</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Lock size={24} className="text-navy-900" />
                        <span className="text-[8px] font-black">TLS 1.3</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Smartphone size={24} className="text-navy-900" />
                        <span className="text-[8px] font-black">2FA</span>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

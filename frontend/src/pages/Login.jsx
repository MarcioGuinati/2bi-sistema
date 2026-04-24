import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, Smartphone, TrendingUp, Zap, Sun, Moon } from 'lucide-react';
import heroImage from '../assets/login-hero-premium.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [require2FA, setRequire2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const { login, verify2FALogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      if (require2FA) {
        await verify2FALogin(tempToken, twoFactorCode);
        navigate('/panel');
        return;
      }

      const response = await login(email, password);
      
      if (response && response.twoFactorRequired) {
        setRequire2FA(true);
        setTempToken(response.tempToken);
        setLoading(false);
        return;
      }

      navigate('/panel'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciais inválidas. Verifique seus dados.');
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
                 <img src="/logo_2bi.png" alt="2BI" className="w-32 h-auto dark:brightness-0 dark:invert" />
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-8 right-8 z-20">
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-gold hover:text-navy-900 transition-all shadow-sm group"
                >
                    {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-45 transition-transform" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform" />}
                </button>
            </div>

            <div className="mb-10 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Ambiente Seguro</span>
                </div>
                <h3 className="text-4xl font-black text-[var(--text-primary)] font-heading tracking-tighter italic">Autenticação</h3>
                <p className="text-[var(--text-secondary)] font-semibold text-sm mt-1">Conecte-se para gerenciar seus ativos de alto valor.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-[11px] font-black uppercase tracking-wider border border-red-100 dark:border-red-900/30 flex items-center gap-3"
                    >
                        <Shield size={16} /> {error}
                    </motion.div>
                )}

                {!require2FA ? (
                    <>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4 tracking-[0.2em]">Identificação</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] rounded-[2rem] pl-16 pr-6 py-5 focus:border-gold outline-none transition-all shadow-sm font-bold text-[var(--text-primary)]"
                                    placeholder="E-mail ou ID de Usuário"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-4">
                                <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] tracking-[0.2em]">Senha Criptografada</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] rounded-[2rem] pl-16 pr-16 py-5 focus:border-gold outline-none transition-all shadow-sm font-bold text-[var(--text-primary)]"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 hover:text-gold transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-4 text-[11px]">
                            <label className="flex items-center gap-2 text-[var(--text-secondary)] font-bold cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-primary)] bg-[var(--bg-primary)] text-gold focus:ring-gold transition-all" />
                                Lembrar neste dispositivo
                            </label>
                            <button type="button" className="text-[var(--text-primary)] font-black uppercase tracking-widest hover:text-gold transition-colors">Solicitar Nova Senha</button>
                        </div>
                    </>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 text-center"
                    >
                        <div className="p-6 bg-gold/5 border border-gold/20 rounded-[2rem]">
                            <Smartphone className="w-12 h-12 text-gold mx-auto mb-4" />
                            <h4 className="text-[var(--text-primary)] font-black italic tracking-tight mb-2">Google Authenticator</h4>
                            <p className="text-[var(--text-secondary)] text-xs font-semibold">Insira o código de 6 dígitos gerado pelo seu aplicativo de autenticação.</p>
                        </div>
                        
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                            <input 
                                type="text" 
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                required
                                maxLength={6}
                                className="w-full bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] rounded-[2rem] pl-16 pr-6 py-6 text-center text-3xl font-black tracking-[0.5em] focus:border-gold outline-none transition-all shadow-sm text-[var(--text-primary)]"
                                placeholder="000000"
                                autoFocus
                            />
                        </div>

                        <button 
                            type="button" 
                            onClick={() => setRequire2FA(false)}
                            className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] hover:text-gold transition-colors"
                        >
                            Voltar para login principal
                        </button>
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-900 dark:bg-gold text-white dark:text-navy-900 !py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-gold hover:text-navy-900 dark:hover:bg-white transition-all shadow-2xl active:scale-[0.98] disabled:opacity-70 group"
                >
                    {loading ? 'Validando...' : require2FA ? 'Confirmar Autenticação' : 'Acessar Workspace'}
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <ArrowRight size={20} />
                    </motion.div>
                </button>
            </form>

            <div className="mt-16 text-center">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-[1px] flex-1 bg-[var(--border-primary)]"></div>
                    <span className="text-[9px] uppercase font-black text-[var(--text-secondary)] tracking-[0.3em]">Criptografia de Ponta a Ponta</span>
                    <div className="h-[1px] flex-1 bg-[var(--border-primary)]"></div>
                </div>
                
                <div className="flex justify-center gap-8 opacity-20 dark:opacity-40 grayscale dark:grayscale-0 hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                    <div className="flex flex-col items-center gap-1">
                        <Shield size={24} className="text-[var(--text-primary)]" />
                        <span className="text-[8px] font-black text-[var(--text-primary)]">256-BIT</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Lock size={24} className="text-[var(--text-primary)]" />
                        <span className="text-[8px] font-black text-[var(--text-primary)]">TLS 1.3</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Smartphone size={24} className="text-[var(--text-primary)]" />
                        <span className="text-[8px] font-black text-[var(--text-primary)]">2FA</span>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

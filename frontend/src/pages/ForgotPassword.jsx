import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2,
  RefreshCcw,
  Smartphone,
  Zap,
  Sun,
  Moon,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import heroImage from '../assets/login-hero-premium.png';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  // Auto-slide every 6 seconds (Reuse login logic)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSendToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/forgot-password', { email });
      success('Código enviado! Verifique seu e-mail.');
      setStep(2);
    } catch (err) {
      error(err.response?.data?.error || 'Erro ao enviar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return error('As senhas não coincidem');
    }
    setLoading(true);
    try {
      await api.post('/reset-password', { email, token, newPassword });
      success('Senha redefinida com sucesso!');
      setStep(3);
    } catch (err) {
      error(err.response?.data?.error || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex overflow-hidden font-sans">
      {/* LEFT SIDE - VISUAL HERO (Macthing Login) */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-navy-900">
        <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
        >
            <img 
                src={heroImage} 
                alt="2BI Platform" 
                className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent"></div>
            <div className="absolute inset-0 bg-navy-900/20 backdrop-grayscale-[30%]"></div>
        </motion.div>
        
        <div className="relative z-10 flex flex-col justify-between h-full p-20 w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <img 
                    src="/logo_2bi.png" 
                    alt="2BI" 
                    className="w-40 h-auto filter brightness-0 invert"
                />
            </motion.div>

            <div className="relative h-[480px] flex flex-col justify-center">
                {currentSlide === 0 ? (
                    <motion.div 
                        key="slide-1"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-navy-900">
                                <Shield size={20} />
                            </div>
                            <span className="text-gold font-black uppercase tracking-[0.3em] text-xs">Proteção de Dados</span>
                        </div>
                        <h2 className="text-5xl font-black text-white italic leading-[1] tracking-tighter mb-8">
                            Segurança em <br/> <span className="text-gold">Primeiro Lugar.</span>
                        </h2>
                        <p className="max-w-md text-white/70 font-medium leading-relaxed">
                            Utilizamos criptografia de ponta a ponta e protocolos bancários para garantir que apenas você tenha acesso ao seu futuro financeiro.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="slide-2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                    >
                        <h2 className="text-5xl md:text-7xl font-black text-white italic leading-[1] tracking-tighter mb-8">
                            Sua jornada <br/> <span className="text-gold">Continua</span> aqui.
                        </h2>
                        <p className="text-white/60 font-bold uppercase tracking-[0.3em] text-xs">Acesso restrito e monitorado</p>
                    </motion.div>
                )}

                <div className="flex gap-3 mt-12">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === 0 ? 'w-16 bg-gold' : 'w-4 bg-white/20'}`}></div>
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === 1 ? 'w-16 bg-gold' : 'w-4 bg-white/20'}`}></div>
                </div>
            </div>

            <div className="text-white/30 text-[10px] font-bold tracking-[0.5em] uppercase">
                Secure Authentication Node v2.0
            </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORGOT PASSWORD FORM */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 lg:p-24 bg-[var(--bg-primary)] relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full relative z-10"
        >
            <div className="lg:hidden flex justify-center mb-12">
                 <img src="/logo_2bi.png" alt="2BI" className="w-32 h-auto dark:brightness-0 dark:invert" />
            </div>

            {/* Theme Toggle */}
            <div className="absolute top-8 right-8 z-20">
                <button onClick={toggleTheme} className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-gold hover:text-navy-900 transition-all shadow-sm">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="mb-10 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">
                        {step === 1 ? 'Recuperação' : step === 2 ? 'Autenticação' : 'Confirmado'}
                    </span>
                </div>
                <h3 className="text-4xl font-black text-[var(--text-primary)] font-heading tracking-tighter italic uppercase">
                    {step === 1 ? 'Reset de Senha' : step === 2 ? 'Novo Acesso' : 'Sucesso'}
                </h3>
                <p className="text-[var(--text-secondary)] font-semibold text-sm mt-1">
                    {step === 1 ? 'Inicie a recuperação da sua conta 2BI.' : step === 2 ? 'Valide seu código e crie uma nova senha.' : 'Sua senha foi atualizada com sucesso.'}
                </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form 
                  key="form1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendToken} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4 tracking-[0.2em]">Seu E-mail</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] rounded-[2rem] pl-16 pr-6 py-5 focus:border-gold outline-none transition-all shadow-sm font-bold text-[var(--text-primary)]"
                        placeholder="nome@email.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-900 dark:bg-gold text-white dark:text-navy-900 !py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-gold hover:text-navy-900 transition-all shadow-2xl disabled:opacity-70"
                  >
                    {loading ? 'Processando...' : 'Enviar Código'}
                    <ChevronRight size={18} />
                  </button>
                  
                  <Link to="/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-gold transition-all">
                    <ArrowLeft size={14} /> Voltar para o Login
                  </Link>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form 
                  key="form2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword} 
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-gold ml-4 tracking-[0.2em]">Token (6 dígitos)</label>
                    <input 
                      type="text" 
                      maxLength="6"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full bg-[var(--bg-secondary)] border-2 border-gold/30 rounded-[2rem] py-6 text-center text-3xl font-black tracking-[0.4em] focus:border-gold outline-none transition-all text-[var(--text-primary)]"
                      placeholder="000000"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4 tracking-[0.2em]">Nova Senha</label>
                      <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] rounded-[2.5rem] pl-16 pr-6 py-5 focus:border-gold outline-none text-[var(--text-primary)] font-bold"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4 tracking-[0.2em]">Confirmar</label>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                        <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] rounded-[2.5rem] pl-16 pr-6 py-5 focus:border-gold outline-none text-[var(--text-primary)] font-bold"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-navy-900 dark:bg-gold text-white dark:text-navy-900 !py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-gold hover:text-navy-900 transition-all shadow-2xl disabled:opacity-70"
                  >
                    {loading ? 'Validando...' : 'Atualizar Senha'}
                    <CheckCircle2 size={18} />
                  </button>
                </motion.form>
              )}

              {step === 3 && (
                <motion.div 
                  key="form3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8"
                >
                  <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto border-2 border-gold/20">
                    <CheckCircle2 className="text-gold" size={48} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-[var(--text-primary)] uppercase italic mb-2">Sucesso Total</h4>
                    <p className="text-[var(--text-secondary)] text-sm font-semibold italic">Sua senha foi redefinida. Utilize suas novas credenciais para acessar o painel estratégico.</p>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-navy-900 dark:bg-gold text-white dark:text-navy-900 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:opacity-90 transition-all"
                  >
                    Ir para Login
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Matching Login */}
            <div className="mt-16 text-center">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-[1px] flex-1 bg-[var(--border-primary)]"></div>
                    <span className="text-[9px] uppercase font-black text-[var(--text-secondary)] tracking-[0.3em]">Membro 2BI Network</span>
                    <div className="h-[1px] flex-1 bg-[var(--border-primary)]"></div>
                </div>
                <div className="flex justify-center gap-8 opacity-20 dark:opacity-40 grayscale transition-all">
                    <Shield size={20} className="text-[var(--text-primary)]" />
                    <Lock size={20} className="text-[var(--text-primary)]" />
                    <Smartphone size={20} className="text-[var(--text-primary)]" />
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  Lock, 
  Clock, 
  UserCheck 
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const SecuritySettings = () => {
  const [status, setStatus] = useState('loading'); // 'loading', 'disabled', 'verifying', 'enabled'
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { success, error: notifyError } = useNotification();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setStatus('loading');
      const res = await api.get('/2fa/status');
      if (res.data.enabled) {
        setStatus('enabled');
      } else {
        setStatus('disabled');
      }
    } catch (err) {
      notifyError('Erro ao verificar status de segurança');
    }
  };

  const handleSetup = async () => {
    try {
      setStatus('loading');
      const res = await api.post('/2fa/setup');
      setQrCode(res.data.qrCodeUrl);
      setSecret(res.data.secret);
      setStatus('verifying');
    } catch (err) {
      notifyError('Erro ao iniciar configuração');
      setStatus('disabled');
    }
  };

  const handleVerifyAndEnable = async (e) => {
    e.preventDefault();
    if (code.length < 6) return;
    
    try {
      setError('');
      await api.post('/2fa/enable', { code });
      success('Autenticação de dois fatores ativada!');
      setStatus('enabled');
    } catch (err) {
      setError('Código inválido. Tente novamente.');
    }
  };

  const handleDisable = async () => {
    try {
      await api.post('/2fa/disable');
      success('Segurança 2FA desativada.');
      setStatus('disabled');
    } catch (err) {
      notifyError('Erro ao desativar segurança');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SystemLayout title="Segurança">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black font-heading tracking-tight italic text-[var(--text-primary)]">Configurações de Segurança</h1>
            <p className="text-[var(--text-secondary)] font-bold text-sm">Gerencie a proteção da sua conta e protocolos de acesso.</p>
          </div>
          <div className="flex items-center gap-3 bg-green-500/10 px-5 py-3 rounded-2xl border border-green-500/20">
             <Lock size={18} className="text-green-500" />
             <span className="text-green-500 font-black text-[10px] uppercase tracking-widest leading-none">Ambiente Criptografado</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Security Health */}
          <div className="md:col-span-1 space-y-6">
            <div className="card-premium p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${status === 'enabled' ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                 {status === 'enabled' ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
               </div>
               
               <h3 className="text-lg font-black text-[var(--text-primary)] italic mb-2 leading-tight">
                 Status da Conta: <br/> 
                 <span className={status === 'enabled' ? 'text-green-500' : 'text-red-500 underline'}>
                   {status === 'enabled' ? 'Protegida' : 'Vulnerável'}
                 </span>
               </h3>
               <p className="text-[var(--text-secondary)] text-xs font-bold leading-relaxed mb-6">
                 {status === 'enabled' 
                   ? 'Seu sistema está operando sob protocolos de autenticação em duas etapas.' 
                   : 'Ative o 2FA para garantir que apenas você possa acessar este painel gestor.'}
               </p>

               <div className="space-y-3 border-t border-[var(--border-primary)] pt-6">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    <UserCheck size={14} className="text-gold" /> Login Único Ativo
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    <Clock size={14} className="text-gold" /> Sessão de 7 Dias
                  </div>
               </div>
            </div>

            <div className="bg-navy-900 dark:bg-navy-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-gold font-black uppercase text-[10px] tracking-[0.4em] mb-3">Recomendação 2BI</h4>
                 <p className="text-xs font-bold leading-relaxed text-white/70 italic">
                   "A segurança patrimonial começa no acesso aos dados. Nunca compartilhe sua chave 2FA ou senha mestra."
                 </p>
               </div>
               <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Right Column - Configuration Area */}
          <div className="md:col-span-2">
            <div className="card-premium h-full overflow-hidden flex flex-col">
              <div className="p-10 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] opacity-80">
                <h3 className="text-xl font-black text-[var(--text-primary)] italic">Google Authenticator (2FA)</h3>
                <p className="text-[var(--text-secondary)] text-xs font-bold mt-1 uppercase tracking-widest">Procedimento de Autenticação TOTP</p>
              </div>

              <div className="p-10 flex-1 bg-[var(--bg-secondary)]">
                {status === 'loading' ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Sincronizando com Servidor...</p>
                  </div>
                ) : status === 'disabled' ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-[var(--bg-primary)] rounded-full flex items-center justify-center text-[var(--text-secondary)]">
                      <Smartphone size={48} />
                    </div>
                    <div className="max-w-sm">
                      <h4 className="text-2xl font-black text-[var(--text-primary)] mb-4 italic">Pronto para aumentar sua segurança?</h4>
                      <p className="text-[var(--text-secondary)] text-sm font-bold leading-relaxed mb-8">
                        Configure seu smartphone para gerar códigos de acesso únicos. Este procedimento leva menos de 1 minuto.
                      </p>
                      <button 
                        onClick={handleSetup}
                        className="btn-primary w-full max-w-[280px] !py-5 shadow-gold/20 font-black uppercase tracking-widest text-xs"
                      >
                        Iniciar Configuração
                      </button>
                    </div>
                  </div>
                ) : status === 'verifying' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-in slide-in-from-bottom-5 duration-500">
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-[2.5rem] border-4 border-[var(--bg-primary)] shadow-2xl flex justify-center inline-block mx-auto relative group">
                        <img src={qrCode} alt="QR Code" className="w-full h-auto max-w-[240px]" />
                        <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.2rem]"></div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4 tracking-[0.2em]">Chave de Configuração Manual</label>
                        <div className="flex items-center gap-3 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-primary)] group">
                          <Key size={18} className="text-gold" />
                          <code className="flex-1 text-xs font-mono font-black text-[var(--text-primary)] truncate">{secret}</code>
                          <button 
                            onClick={copyToClipboard}
                            className="bg-[var(--bg-secondary)] p-2 rounded-xl border border-[var(--border-primary)] hover:border-gold hover:text-gold transition-all shadow-sm"
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h4 className="text-xl font-black text-[var(--text-primary)] italic mb-2">Validação Final</h4>
                        <p className="text-[var(--text-secondary)] text-sm font-bold">Insira o código gerado no app para ativar a proteção.</p>
                      </div>

                      <form onSubmit={handleVerifyAndEnable} className="space-y-6">
                        <input 
                          type="text" 
                          value={code}
                          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                          maxLength={6}
                          placeholder="000 000"
                          className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] p-6 rounded-3xl text-center text-4xl font-black tracking-[0.4em] outline-none focus:border-gold transition-all text-[var(--text-primary)]"
                        />
                        {error && (
                          <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest animate-pulse">
                            {error}
                          </p>
                        )}
                        <div className="flex gap-4 pt-4">
                          <button 
                            type="button"
                            onClick={() => setStatus('disabled')}
                            className="flex-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest hover:opacity-80 transition-all font-heading"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit"
                            disabled={code.length < 6}
                            className="flex-[2] bg-gold text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-gold/20 disabled:opacity-50"
                          >
                            Confirmar Ativação
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-10 py-10 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                      <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 shadow-2xl shadow-green-500/20 border-4 border-[var(--bg-secondary)]">
                        <ShieldCheck size={64} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-gold rounded-full flex items-center justify-center border-4 border-[var(--bg-secondary)] shadow-lg">
                        <Lock size={16} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="max-w-sm">
                      <h4 className="text-3xl font-black text-[var(--text-primary)] italic mb-4">Segurança Máxima Ativada</h4>
                      <p className="text-[var(--text-secondary)] text-sm font-bold leading-relaxed mb-10">
                        Sua conta está protegida por um token dinâmico. Todas as tentativas de login agora exigirão sincronização com seu dispositivo móvel.
                      </p>
                      
                      <div className="p-6 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-[2rem] text-left mb-10">
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center text-green-500 shadow-sm shrink-0">
                             <Lock size={20} />
                           </div>
                           <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Protocolo de Login</p>
                             <p className="text-xs text-[var(--text-secondary)] font-semibold italic leading-snug">
                               "Sempre mantenha seu Google Authenticator carregado e em mãos ao entrar na plataforma."
                             </p>
                           </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleDisable}
                        className="text-red-500/60 font-black text-[10px] uppercase tracking-[0.2em] hover:text-red-500 hover:underline transition-all"
                      >
                        Desativar Proteção 2FA
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
};

export default SecuritySettings;

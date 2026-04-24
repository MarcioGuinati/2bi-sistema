import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save, 
  ShieldCheck,
  Key
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useNotification();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        error('A imagem deve ter no máximo 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put('/profile', profileForm);
      updateUser(response.data.user);
      success('Perfil atualizado com sucesso!');
    } catch (err) {
      error(err.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      error('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      await api.put('/profile', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      success('Senha alterada com sucesso!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      error(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SystemLayout>
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tighter text-[var(--text-primary)] uppercase italic">Configurações de Conta</h1>
          <p className="text-[var(--text-secondary)] font-medium tracking-tight">Gerencie sua identidade e segurança na plataforma.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Avatar & Info Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-premium p-8 flex flex-col items-center text-center space-y-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 rounded-[2.5rem] bg-navy-900 border-4 border-gold/20 overflow-hidden shadow-2xl transition-all group-hover:scale-105 group-hover:border-gold">
                  {profileForm.avatar_url ? (
                    <img src={profileForm.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gold font-black uppercase italic">
                      {user?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gold rounded-2xl flex items-center justify-center text-navy-900 shadow-xl border-4 border-[var(--bg-secondary)] group-hover:scale-110 transition-all">
                  <Camera size={18} />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                />
              </div>

              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)] truncate">{user?.name}</h3>
                <span className="text-[10px] font-black bg-gold/10 text-gold px-3 py-1 rounded-full uppercase tracking-widest">{user?.role}</span>
              </div>

              <div className="pt-4 border-t border-[var(--border-primary)] w-full text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest leading-relaxed">
                Recomendado: Imagem quadrada, de até 2MB.
              </div>
            </div>

            <div className="bg-navy-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl"></div>
               <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-gold" size={20} />
                  <span className="text-xs font-black uppercase tracking-widest text-gold">Proteção Ativa</span>
               </div>
               <p className="text-[11px] leading-relaxed opacity-70 italic font-medium">Sua conta está protegida por criptografia de ponta a ponta e auditoria de acessos em tempo real.</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Info Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium p-8 md:p-10 space-y-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
            >
              <div className="flex items-center gap-3 border-b border-[var(--border-primary)] pb-6">
                <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center">
                  <User size={18} />
                </div>
                <h4 className="text-lg font-black uppercase tracking-tighter italic text-[var(--text-primary)]">Dados Pessoais</h4>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="input-premium pl-12"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4">E-mail de Acesso</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="input-premium pl-12"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary w-full md:w-auto px-10 py-4 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95"
                  >
                    <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Security/Password Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-premium p-8 md:p-10 space-y-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-[var(--border-primary)] pb-6">
                <div className="w-8 h-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                  <Key size={18} />
                </div>
                <h4 className="text-lg font-black uppercase tracking-tighter italic text-[var(--text-primary)]">Segurança & Senha</h4>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4">Senha Atual</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      value={passwordForm.current_password}
                      onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="input-premium pl-12"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4">Nova Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password" 
                        value={passwordForm.new_password}
                        onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        className="input-premium pl-12"
                        placeholder="Mín. 6 caracteres"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-[var(--text-secondary)] ml-4">Confirmar Nova Senha</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password" 
                        value={passwordForm.confirm_password}
                        onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        className="input-premium pl-12"
                        placeholder="Repita a nova senha"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                  type="submit" 
                  className="w-full md:w-auto px-10 py-4 bg-navy-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-navy-800 transition-all active:scale-95"
                  >
                    <Key size={18} /> Alterar Senha
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
};

export default UserProfile;

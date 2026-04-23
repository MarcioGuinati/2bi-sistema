import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Lock, 
  Database, 
  MessageCircle, 
  Save, 
  Zap,
  Info,
  Check,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const AdminAIConfig = () => {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [config, setConfig] = useState({
    openai_key: '',
    openai_model: 'gpt-3.5-turbo',
    ai_system_prompt: 'Você é um assistente financeiro pessoal de elite da 2BI Planejamento. Analise os dados e dê conselhos práticos, profissionais e encorajadores em português.'
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/admin/ai-config');
        if (response.data) {
          setConfig(prev => ({
            ...prev,
            ...response.data
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar config IA', err);
      } finally {
        setFetching(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/admin/ai-config', config);
      success('Configurações de IA atualizadas com sucesso!');
    } catch (err) {
      error('Erro ao salvar configurações de IA');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SystemLayout>
        <div className="flex items-center justify-center h-full py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
        </div>
      </SystemLayout>
    );
  }

  return (
    <SystemLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          <div className="p-4 bg-navy-900 rounded-[2.5rem] text-gold shadow-xl shadow-navy-900/10">
            <Zap size={40} />
          </div>
          <div>
            <h2 className="text-4xl font-black font-heading tracking-tight text-[var(--text-primary)]">Configuração de IA</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Integração Oficial com OpenAI / ChatGPT</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-primary)] shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-navy-900/5">
              <div className="p-8 space-y-6">
                
                <div className="space-y-4">
                   <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                     <Lock size={14} className="text-gold" /> OpenAI API Key
                   </label>
                   <input
                    type="password"
                    placeholder="sk-..."
                    value={config.openai_key || ''}
                    onChange={(e) => setConfig({...config, openai_key: e.target.value})}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-gold outline-none transition-all font-medium text-[var(--text-primary)]"
                   />
                   <p className="text-[10px] text-slate-500 font-bold">Nunca compartilhe sua chave. Ela é usada para processar os insights dos clientes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <Database size={14} className="text-gold" /> Modelo do Agente
                    </label>
                    <select
                      value={config.openai_model || 'gpt-3.5-turbo'}
                      onChange={(e) => setConfig({...config, openai_model: e.target.value})}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-gold outline-none transition-all font-medium text-[var(--text-primary)]"
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido/Custo Baixo)</option>
                      <option value="gpt-4o">GPT-4o (O mais inteligente)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-4o-mini">GPT-4o Mini (Ótimo custo/benefício)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                     <MessageCircle size={14} className="text-gold" /> Prompt do Sistema (DNA do Consultor)
                   </label>
                   <textarea
                    rows={6}
                    placeholder="Defina como a IA deve se comportar..."
                    value={config.ai_system_prompt || ''}
                    onChange={(e) => setConfig({...config, ai_system_prompt: e.target.value})}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-gold outline-none transition-all font-medium text-[var(--text-primary)] resize-none"
                   />
                   <p className="text-[10px] text-slate-500 font-bold">Aqui você define a personalidade. Diga se ela deve ser agressiva em cortar gastos ou mais paciente.</p>
                </div>
              </div>

              <div className="p-8 bg-[var(--bg-primary)]/50 border-t border-[var(--border-primary)]">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-navy-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-gold transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-gold/5 border border-gold/20 rounded-[2.5rem] p-8 space-y-4">
              <div className="flex items-center gap-3 text-gold">
                <Info size={24} />
                <h4 className="font-black text-sm uppercase tracking-wider">Como Funciona?</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Ao configurar a IA, seus clientes passam a ter acesso a uma nova aba chamada <strong>Insights de IA</strong>.
              </p>
              <ul className="space-y-3">
                {[
                  'Analisa gastos vs metas',
                  'Identifica gargalos financeiros',
                  'Dá 3 dicas práticas mensais',
                  'Usa o DNA da sua mentoria'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
                    <Check size={14} className="text-green-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-navy-900 text-white rounded-[2.5rem] p-8 space-y-4 shadow-xl shadow-navy-900/20">
              <div className="flex items-center gap-3 text-gold">
                <HelpCircle size={24} />
                <h4 className="font-black text-sm uppercase tracking-wider">Aviso de Custos</h4>
              </div>
              <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                Cada consulta de insight gera um pequeno custo na sua API da OpenAI. O modelo <strong>GPT-4o Mini</strong> é altamente recomendado por ser extremamente barato e eficiente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SystemLayout>
  );
};

const styles = `
  .dark .text-slate-400 { color: #94a3b8 !important; }
  .dark .text-slate-500 { color: #cbd5e1 !important; }
`;

export default () => (
  <>
    <style>{styles}</style>
    <AdminAIConfig />
  </>
);

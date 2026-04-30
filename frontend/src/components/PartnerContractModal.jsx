import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Download, 
  Send, 
  RefreshCw, 
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { generateContractPDF } from '../utils/pdfGenerator';

const PartnerContractModal = ({ isOpen, onClose, partner }) => {
  const { success, error, info } = useNotification();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchContracts = async () => {
    if (!partner) return;
    try {
      setLoading(true);
      const res = await api.get(`/contracts/${partner.id}`);
      setContracts(res.data);
    } catch (err) {
      console.error('Erro ao buscar contratos do parceiro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchContracts();
  }, [isOpen, partner]);

  const handleGenerateContract = async () => {
    try {
      setLoading(true);
      // Create contract record in DB (no values for partners)
      const res = await api.post('/contracts', {
        user_id: partner.id,
        title: 'Contrato de Parceria Comercial 2BI',
        setupValue: 0,
        monthlyValue: 0,
        billingCycle: 'once',
        startDate: new Date().toISOString().split('T')[0],
        recurrence: 1,
        hasReportAccess: true,
        hasAIAccess: true
      });
      
      success('Contrato gerado com sucesso!');
      fetchContracts();
    } catch (err) {
      error('Erro ao gerar contrato');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (contract) => {
    try {
      const doc = await generateContractPDF(contract, partner, 'partner');
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      error('Erro ao gerar visualização');
    }
  };

  const handleDownload = async (contract) => {
    try {
      const doc = await generateContractPDF(contract, partner, 'partner');
      doc.save(`Contrato_Parceria_2BI_${partner.name.replace(/\s+/g, '_')}.pdf`);
      success('Download iniciado!');
    } catch (err) {
      error('Erro ao baixar contrato');
    }
  };

  const handleSendToAssinafy = async (contract) => {
    if (!partner.cpf) {
      return error('O parceiro precisa ter o CPF cadastrado para assinar o contrato.');
    }

    try {
      const doc = await generateContractPDF(contract, partner, 'partner');
      const pdfData = doc.output('datauristring').split(',')[1];
      
      await api.post(`/contracts/${contract.id}/signature`, {
        documentBase64: pdfData
      });
      
      success('Enviado para Assinafy com sucesso!');
      fetchContracts();
    } catch (err) {
      error(err.response?.data?.error || 'Erro ao integrar com Assinafy');
    }
  };

  const handleSyncStatus = async (contract) => {
    try {
      const res = await api.get(`/contracts/${contract.id}/signature/status`);
      if (res.data.status === 'signed') {
        success('Assinatura confirmada!');
      } else {
        info('Contrato ainda pendente de assinatura.');
      }
      fetchContracts();
    } catch (err) {
      error('Erro ao sincronizar status');
    }
  };

  const handleDownloadSigned = async (contract) => {
    try {
      const response = await api.get(`/contracts/${contract.id}/signature/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contrato_Parceria_ASSINADO_${partner.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Download do assinado iniciado!');
    } catch (err) {
      error('Erro ao baixar contrato assinado');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[var(--bg-secondary)] rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10"
          >
            {/* Header */}
            <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center bg-navy-900 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20">
                  <ShieldCheck className="text-gold" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black font-heading italic">Contrato de Parceria</h3>
                  <p className="text-gold text-[10px] font-black uppercase tracking-widest">{partner?.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 custom-scrollbar">
              {/* List Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contratos Registrados</h4>
                  {contracts.length === 0 && (
                    <button 
                      onClick={handleGenerateContract}
                      className="text-[10px] font-black uppercase bg-gold text-navy-900 px-4 py-2 rounded-xl hover:bg-white transition-all shadow-lg"
                    >
                      Gerar Agora
                    </button>
                  )}
                </div>

                {loading && contracts.length === 0 ? (
                  <div className="py-20 flex justify-center">
                    <RefreshCw className="animate-spin text-gold" size={32} />
                  </div>
                ) : contracts.length > 0 ? (
                  <div className="space-y-4">
                    {contracts.map(contract => (
                      <div key={contract.id} className="p-6 bg-[var(--bg-primary)] rounded-[2rem] border border-[var(--border-primary)] group hover:border-gold/30 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${contract.signature_status === 'signed' ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-gold'}`}>
                              {contract.signature_status === 'signed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                            </div>
                            <div>
                              <div className="text-xs font-black uppercase tracking-tight">{contract.title}</div>
                              <div className="text-[9px] font-bold text-slate-400">Gerado em: {new Date(contract.createdAt).toLocaleDateString('pt-BR')}</div>
                            </div>
                          </div>
                          {contract.signature_status === 'signed' && (
                            <span className="bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Ativo / Assinado</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-4">
                          <button 
                            onClick={() => handlePreview(contract)}
                            className="flex items-center justify-center gap-2 py-2 bg-white dark:bg-navy-900 rounded-xl text-[9px] font-black uppercase border border-[var(--border-primary)] hover:border-gold transition-all"
                          >
                            <Eye size={12} /> Preview
                          </button>
                          <button 
                            onClick={() => handleDownload(contract)}
                            className="flex items-center justify-center gap-2 py-2 bg-white dark:bg-navy-900 rounded-xl text-[9px] font-black uppercase border border-[var(--border-primary)] hover:border-gold transition-all"
                          >
                            <Download size={12} /> PDF
                          </button>
                          
                          {!contract.signature_id ? (
                            <button 
                              onClick={() => handleSendToAssinafy(contract)}
                              className="col-span-2 flex items-center justify-center gap-2 py-3 bg-navy-900 text-white dark:bg-gold dark:text-navy-900 rounded-xl text-[10px] font-black uppercase hover:scale-[1.02] transition-all shadow-lg"
                            >
                              <Send size={14} /> Enviar Assinafy
                            </button>
                          ) : contract.signature_status !== 'signed' ? (
                            <button 
                              onClick={() => handleSyncStatus(contract)}
                              className="col-span-2 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:scale-[1.02] transition-all shadow-lg"
                            >
                              <RefreshCw size={14} /> Sincronizar Assinafy
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleDownloadSigned(contract)}
                              className="col-span-2 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase hover:scale-[1.02] transition-all shadow-lg"
                            >
                              <Download size={14} /> Baixar Assinado
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-[var(--border-primary)] rounded-[2rem]">
                    <FileText className="mx-auto text-slate-300 mb-4" size={40} />
                    <p className="text-sm font-bold text-slate-400">Nenhum contrato gerado.</p>
                  </div>
                )}
              </div>

              {/* Preview Section */}
              <div className="bg-[var(--bg-primary)] rounded-[2.5rem] border border-[var(--border-primary)] overflow-hidden relative min-h-[400px] flex items-center justify-center">
                {previewUrl ? (
                  <iframe src={previewUrl} className="w-full h-full border-none" title="PDF Preview" />
                ) : (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-white dark:bg-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border-primary)] shadow-sm">
                      <Eye className="text-slate-300" size={24} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Visualize aqui o documento</p>
                  </div>
                )}
                {previewUrl && (
                  <button 
                    onClick={() => setPreviewUrl(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-all"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="p-6 bg-slate-50 dark:bg-navy-900/40 border-t border-[var(--border-primary)] flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <ShieldCheck size={14} className="text-gold" /> Documento gerado com validade jurídica via Assinafy
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-white dark:bg-navy-900 text-[10px] font-black uppercase border border-[var(--border-primary)] hover:border-gold transition-all"
              >
                Fechar Painel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PartnerContractModal;

import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Plus, 
  Search, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  FileText, 
  Link as LinkIcon,
  X,
  Save,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const { success, error, confirm } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const isAdmin = user?.role === 'admin';

  const [form, setForm] = useState({
    title: '',
    content: '',
    link: '',
    category: 'Geral'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/knowledge-base');
      setItems(res.data);
    } catch (err) {
      error('Falha ao carregar base de conhecimento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title,
        content: item.content || '',
        link: item.link || '',
        category: item.category || 'Geral'
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        content: '',
        link: '',
        category: 'Geral'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/knowledge-base/${editingItem.id}`, form);
        success('Item atualizado com sucesso!');
      } else {
        await api.post('/knowledge-base', form);
        success('Novo item adicionado à base!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      error('Erro ao salvar item');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Excluir Item',
      message: 'Tem certeza que deseja remover este item da base de conhecimento?',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/knowledge-base/${id}`);
          success('Item excluído');
          fetchData();
        } catch (err) {
          error('Erro ao excluir item');
        }
      }
    });
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <SystemLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20">
                <Book className="text-gold" size={20} />
              </div>
              <h1 className="text-3xl font-bold font-heading">Base de Conhecimento</h1>
            </div>
            <p className="text-slate-400 font-medium tracking-tight">Central de documentos, tutoriais e links estratégicos.</p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} /> Novo Conteúdo
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por título ou categoria..."
              className="w-full pl-12 pr-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl text-sm outline-none focus:border-gold transition-all text-[var(--text-primary)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Carregando Conhecimento...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-premium group hover:border-gold/30 transition-all duration-500"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-gold/10 text-gold text-[9px] font-black uppercase tracking-widest rounded-lg border border-gold/20">
                        {item.category}
                      </span>
                      {isAdmin && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(item)}
                            className="p-2 bg-[var(--bg-primary)] hover:bg-gold/10 hover:text-gold rounded-xl transition-all text-[var(--text-secondary)]"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-6 leading-relaxed">
                      {item.content || 'Sem descrição adicional.'}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-primary)]">
                      <div className="flex items-center gap-2">
                        {item.link ? (
                          <div className="flex items-center gap-1.5 text-blue-500 font-bold text-[10px] uppercase tracking-tighter">
                            <LinkIcon size={12} /> Google Drive
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                            <FileText size={12} /> Apenas Texto
                          </div>
                        )}
                      </div>

                      {item.link ? (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy-900 transition-all shadow-lg"
                        >
                          Acessar <ExternalLink size={12} />
                        </a>
                      ) : (
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] transition-all"
                        >
                          Visualizar <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="card-premium p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[var(--bg-primary)] rounded-[2.5rem] flex items-center justify-center mb-6 text-slate-300">
              <FolderOpen size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum item encontrado</h3>
            <p className="text-slate-400 max-w-md">A base de conhecimento ainda não possui registros para esta busca ou categoria.</p>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-navy-900/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[var(--bg-secondary)] rounded-[3rem] shadow-2xl overflow-hidden border border-[var(--border-primary)]"
              >
                <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-primary)]/50">
                  <div>
                    <h2 className="text-2xl font-black font-heading italic text-[var(--text-primary)]">
                      {editingItem ? 'Editar Item' : 'Novo Conhecimento'}
                    </h2>
                    <p className="text-[10px] uppercase font-black text-gold tracking-widest">Configuração da Base</p>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] shadow-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-[var(--border-primary)]"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título do Recurso</label>
                      <input
                        required
                        type="text"
                        disabled={!isAdmin}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:border-gold transition-all disabled:opacity-50 text-[var(--text-primary)]"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ex: Manual do Parceiro"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoria</label>
                      <input
                        required
                        type="text"
                        disabled={!isAdmin}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:border-gold transition-all disabled:opacity-50 text-[var(--text-primary)]"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="Ex: Treinamento"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Link (Drive/PDF)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="url"
                        disabled={!isAdmin}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] pl-14 pr-5 py-4 rounded-2xl text-sm font-medium outline-none focus:border-gold transition-all disabled:opacity-50 text-[var(--text-primary)]"
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Conteúdo / Descrição</label>
                    <textarea
                      rows={5}
                      disabled={!isAdmin}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:border-gold transition-all resize-none disabled:opacity-50 text-[var(--text-primary)]"
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Descreva o que é este recurso ou insira o texto aqui..."
                    />
                  </div>

                  {isAdmin && (
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-8 py-4 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-[var(--border-primary)]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-8 py-4 bg-navy-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gold hover:text-navy-900 transition-all shadow-xl flex items-center justify-center gap-2"
                      >
                        <Save size={16} /> Salvar Alterações
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </SystemLayout>
  );
};

export default KnowledgeBase;

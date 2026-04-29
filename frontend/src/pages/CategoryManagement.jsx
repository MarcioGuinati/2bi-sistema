import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Layers,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import api from '../services/api';
import SystemLayout from '../components/SystemLayout';
import { useNotification } from '../context/NotificationContext';

const CategoryManagement = () => {
  const { success, error, confirm } = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'expense' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowModal(false);
      setEditingCat(null);
      setForm({ name: '', type: 'expense' });
      success(editingCat ? 'Categoria atualizada!' : 'Categoria criada com sucesso!');
      fetchData();
    } catch (err) { error('Erro ao salvar categoria'); }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Excluir Categoria',
      message: 'Tem certeza? Se houver transações vinculadas, elas poderão ficar sem categoria.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/categories/${id}`);
          success('Categoria removida');
          fetchData();
        } catch (err) { error('Erro ao excluir categoria'); }
      }
    });
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setForm({ name: cat.name, type: cat.type });
    setShowModal(true);
  };

  return (
    <SystemLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading">Gestão de Categorias</h1>
            <p className="text-[var(--text-secondary)] font-medium tracking-tight">Organize sua taxonomia financeira de forma estratégica.</p>
          </div>
          <button
            onClick={() => { setEditingCat(null); setForm({ name: '', type: 'expense' }); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Nova Categoria
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-navy-900 text-gold rounded-2xl flex items-center justify-center">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400">Total</p>
              <p className="text-xl font-black">{categories.length}</p>
            </div>
          </div>
          <div className="card-premium p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <ArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400">Receitas</p>
              <p className="text-xl font-black">{categories.filter(c => c.type === 'income').length}</p>
            </div>
          </div>
          <div className="card-premium p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <ArrowDownLeft size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400">Despesas</p>
              <p className="text-xl font-black">{categories.filter(c => c.type === 'expense').length}</p>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="card-premium overflow-hidden">
          <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-primary)]/50">
            <h3 className="text-xl font-bold font-heading">Minhas Categorias</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-primary)] text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Nome da Categoria</th>
                  <th className="px-8 py-5">Tipo</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-sm tracking-tight">{c.name}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${c.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {c.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 text-slate-400 hover:text-gold bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)] transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-slate-400 hover:text-red-600 bg-[var(--bg-secondary)] rounded-lg shadow-sm border border-[var(--border-primary)]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--bg-secondary)] rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white flex flex-col max-h-[90vh]">
              <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="bg-navy-900 p-8 text-white flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-xl font-black font-heading tracking-tight !text-white">{editingCat ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                    <p className="text-gold text-[10px] font-black uppercase tracking-widest mt-1">Organização 2BI</p>
                  </div>
                  <button type="button" onClick={() => setShowModal(false)} className="text-white/50 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400">Nome da Categoria</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:border-gold font-bold"
                      placeholder="Ex: Alimentação, Transporte..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-400">Tipo de Fluxo</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, type: 'income' })}
                        className={`py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${form.type === 'income' ? 'border-green-600 bg-green-50 text-green-600' : 'border-slate-100 text-slate-400'}`}
                      >
                        <ArrowUpRight size={18} /> Receita
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, type: 'expense' })}
                        className={`py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${form.type === 'expense' ? 'border-red-600 bg-red-50 text-red-600' : 'bg-[var(--bg-primary)] border-[var(--border-primary)] text-slate-400'}`}
                      >
                        <ArrowDownLeft size={18} /> Despesa
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
                  <button type="submit" className="w-full btn-primary py-5 font-black text-lg shadow-gold/30">
                    {editingCat ? 'Salvar Alterações' : 'Criar Categoria'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SystemLayout >
  );
};

export default CategoryManagement;

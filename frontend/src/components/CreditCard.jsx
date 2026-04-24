import { motion } from 'framer-motion';
import { CreditCard as CardIcon, Edit2, Trash2, FileDigit, ArrowRight } from 'lucide-react';

const CreditCard = ({ account, onClick, onEdit, onDelete, onImport }) => {
  const usedLimit = Math.abs(Number(account.used_limit || 0));
  const totalLimit = Number(account.credit_limit || 1); // Avoid division by zero
  const percentage = Math.min(100, Math.round((usedLimit / totalLimit) * 100));
  
  const getContrastColor = (hex) => {
    if (!hex) return 'text-white';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'text-navy-900' : 'text-white';
  };

  const textColorClass = getContrastColor(account.color);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => onClick(account)}
      className="relative w-full h-[250px] rounded-[2.5rem] p-8 cursor-pointer overflow-hidden shadow-2xl group transition-all"
      style={{ backgroundColor: account.color || '#1e293b' }}
    >
      {/* Action Overlay (Visible on Hover) */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center backdrop-blur-[2px]">
        <div className="flex gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(account); }}
            className="p-4 bg-white/20 hover:bg-white/40 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-110"
            title="Editar"
          >
            <Edit2 size={20} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onImport(account.id); }}
            className="p-4 bg-white/20 hover:bg-white/40 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-110"
            title="Importar OFX"
          >
            <FileDigit size={20} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
            className="p-4 bg-red-500/40 hover:bg-red-500 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-110"
            title="Excluir"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Glossy Overlay */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-60 ${textColorClass}`}>2BI PREMIUM PLATINUM</span>
            <h3 className={`text-2xl font-black italic tracking-tight ${textColorClass}`}>{account.name}</h3>
          </div>
          <div className={`p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 ${textColorClass}`}>
            <CardIcon size={24} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${textColorClass}`}>Fatura Atual</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black italic ${textColorClass}`}>
                R$ {usedLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
              <span className={textColorClass}>Disponível R$ {(totalLimit - usedLimit).toLocaleString('pt-BR')}</span>
              <span className={textColorClass}>{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className={`text-[8px] font-black uppercase opacity-40 ${textColorClass}`}>FECHAMENTO</span>
                <span className={`text-xs font-bold ${textColorClass}`}>{account.invoice_closing_day || '--'}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[8px] font-black uppercase opacity-40 ${textColorClass}`}>VENCIMENTO</span>
                <span className={`text-xs font-bold ${textColorClass}`}>{account.due_day || '--'}</span>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${textColorClass}`}>
              <span className="text-[10px] font-black uppercase tracking-widest">Ver Fatura</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreditCard;

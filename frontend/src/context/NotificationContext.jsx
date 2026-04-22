import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false
  });

  const notify = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = (msg) => notify(msg, 'success');
  const error = (msg) => notify(msg, 'error');

  const confirm = useCallback(({ title, message, onConfirm, isDestructive = false }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      isDestructive
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ success, error, confirm }}>
      {children}

      {/* Toasts Container */}
      <div className="fixed top-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[300px]
                ${toast.type === 'success' 
                  ? 'bg-white/90 border-green-100 text-green-800' 
                  : 'bg-white/90 border-red-100 text-red-800'}
              `}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="text-green-500" size={24} />
              ) : (
                <XCircle className="text-red-500" size={24} />
              )}
              <div className="flex-1">
                <p className="text-sm font-black tracking-tight">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="p-8 text-center space-y-4">
                <div className={`
                    w-16 h-16 mx-auto rounded-2xl flex items-center justify-center
                    ${confirmModal.isDestructive ? 'bg-red-50 text-red-500' : 'bg-gold/10 text-gold'}
                `}>
                    {confirmModal.isDestructive ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
                </div>
                <div>
                    <h3 className="text-xl font-black text-navy-900 font-heading">{confirmModal.title}</h3>
                    <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">{confirmModal.message}</p>
                </div>
                <div className="flex gap-4 pt-4">
                    <button 
                        onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                        className="flex-1 px-6 py-3 rounded-xl border border-slate-100 font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmModal.onConfirm}
                        className={`
                            flex-1 px-6 py-3 rounded-xl font-black text-white shadow-lg transition-all
                            ${confirmModal.isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-navy-900 hover:bg-navy-950 shadow-navy-900/20'}
                        `}
                    >
                        Confirmar
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

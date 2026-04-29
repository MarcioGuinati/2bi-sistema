import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addDays,
  parseISO,
  isToday,
  startOfDay,
  setHours,
  setMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User as UserIcon, 
  MapPin, 
  Calendar as CalendarIcon,
  X,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import SystemLayout from '../components/SystemLayout';
import { motion, AnimatePresence } from 'framer-motion';

const Agenda = () => {
  const { user } = useAuth();
  const { success, error, confirm } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: format(new Date(), "yyyy-MM-dd"),
    time: '09:00',
    duration: '60',
    description: '',
    clientId: '',
    clientName: '',
    invitedAdminId: '',
    meet_url: ''
  });

  useEffect(() => {
    fetchSchedules();
    if (user.role === 'admin' || user.role === 'partner') {
      fetchClients();
    }
    if (user.role === 'partner') {
      fetchPartners(); // To allow inviting admins
    }
  }, [currentDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await api.get('/admin/list-admins');
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const getSchedulesForDay = (day) => {
    return schedules.filter(s => isSameDay(parseISO(s.date), day));
  };

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      if (schedule.isMasked) return; // Cannot edit masked schedules
      
      setEditingSchedule(schedule);
      const dateObj = parseISO(schedule.date);
      setFormData({
        title: schedule.title,
        date: format(dateObj, "yyyy-MM-dd"),
        time: format(dateObj, "HH:mm"),
        duration: schedule.duration?.toString() || '60',
        description: schedule.description || '',
        clientId: schedule.clientId || '',
        clientName: schedule.clientName || '',
        invitedAdminId: schedule.invitedAdminId || '',
        meet_url: schedule.meet_url || ''
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        title: '',
        date: format(selectedDate, "yyyy-MM-dd"),
        time: '09:00',
        duration: '60',
        description: '',
        clientId: '',
        clientName: '',
        invitedAdminId: '',
        meet_url: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dateTime = parseISO(`${formData.date}T${formData.time}`);
      const payload = {
        ...formData,
        date: dateTime.toISOString(),
        duration: parseInt(formData.duration),
        clientId: formData.clientId || null,
        invitedAdminId: formData.invitedAdminId || null
      };

      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule.id}`, payload);
      } else {
        await api.post('/schedules', payload);
      }

      setShowModal(false);
      fetchSchedules();
      success('Agendamento salvo com sucesso!');
    } catch (err) {
      console.error('Error saving schedule:', err);
      error('Erro ao salvar agendamento');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Excluir Agendamento',
      message: 'Deseja realmente remover este compromisso? Esta ação não pode ser desfeita.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/schedules/${id}`);
          fetchSchedules();
          success('Agendamento excluído com sucesso!');
        } catch (err) {
          console.error('Error deleting schedule:', err);
          error('Erro ao excluir agendamento');
        }
      }
    });
  };

  const selectedDaySchedules = getSchedulesForDay(selectedDate);

  return (
    <SystemLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <CalendarIcon className="text-gold w-8 h-8" />
              Agenda
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Gerencie seus compromissos e reuniões.
            </p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            Novo Agendamento
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendário */}
          <div className="lg:col-span-8 card-premium p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold capitalize">
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gold/10 rounded-full transition-colors text-gold">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-sm font-semibold text-gold hover:bg-gold/10 rounded-full transition-colors">
                  Hoje
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gold/10 rounded-full transition-colors text-gold">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-[var(--border-primary)] rounded-xl overflow-hidden border border-[var(--border-primary)] shadow-sm">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="bg-[var(--bg-primary)] p-3 text-center text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {day}
                </div>
              ))}
              
              {daysInMonth.map((day, idx) => {
                const daySchedules = getSchedulesForDay(day);
                const isSel = isSameDay(day, selectedDate);
                const isCurrMonth = isSameMonth(day, currentDate);
                const isTod = isToday(day);

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[100px] p-2 cursor-pointer transition-all duration-300 relative group
                      ${isCurrMonth ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-primary)] opacity-50'}
                      ${isSel ? 'bg-gold/5 border-gold/20 z-10' : 'hover:bg-gold/5'}
                    `}
                  >
                    <span className={`
                      inline-flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full transition-all duration-300
                      ${isTod 
                        ? 'bg-gold text-white shadow-lg shadow-gold/20 scale-110 z-10' 
                        : isCurrMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-30'}
                      ${isSel && !isTod ? 'bg-gold/10 text-gold ring-2 ring-gold' : ''}
                      ${isSel && isTod ? 'ring-2 ring-white ring-offset-2 ring-offset-gold' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>

                    <div className="mt-2 space-y-1">
                      {daySchedules.slice(0, 3).map(schedule => (
                        <div 
                          key={schedule.id}
                          className={`
                            text-[10px] px-1.5 py-0.5 rounded truncate font-medium
                            ${schedule.isMasked 
                              ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' 
                              : 'bg-gold/10 text-gold border border-gold/20'}
                          `}
                        >
                          {format(parseISO(schedule.date), "HH:mm")} {schedule.title}
                        </div>
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="text-[10px] text-[var(--text-secondary)] pl-1 font-medium italic">
                          + {daySchedules.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalhes do Dia */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card-premium p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {selectedDaySchedules.length} agendamento(s)
                  </p>
                </div>
                <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                  <CalendarIcon size={24} />
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar-thin">
                {selectedDaySchedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                    <div className="w-16 h-16 bg-[var(--bg-primary)] rounded-full flex items-center justify-center mb-4">
                      <Clock size={32} />
                    </div>
                    <p className="font-medium text-[var(--text-primary)]">Nenhum compromisso para este dia.</p>
                  </div>
                ) : (
                  selectedDaySchedules.map(schedule => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={schedule.id}
                      className={`
                        p-4 rounded-2xl border transition-all duration-300 relative group
                        ${schedule.isMasked 
                          ? 'bg-slate-50 border-slate-200 dark:bg-navy-800 dark:border-navy-700' 
                          : 'bg-[var(--bg-primary)] border-[var(--border-primary)] hover:border-gold'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-gold font-bold text-sm">
                          <Clock size={14} />
                          {format(parseISO(schedule.date), "HH:mm")}
                          {schedule.duration && (
                            <span className="text-[var(--text-secondary)] font-normal ml-1">
                              ({schedule.duration} min)
                            </span>
                          )}
                        </div>
                        
                        {!schedule.isMasked && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenModal(schedule)}
                              className="p-1.5 hover:bg-gold/10 rounded-lg text-gold transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(schedule.id)}
                              className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className={`font-bold text-lg mb-1 ${schedule.isMasked ? 'text-slate-400 italic' : 'text-[var(--text-primary)]'}`}>
                        {schedule.title}
                      </h4>

                      {!schedule.isMasked && (
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <UserIcon size={14} />
                            <span className="font-medium">
                              {schedule.Client?.name || schedule.clientName || 'Sem cliente'}
                            </span>
                          </div>
                          {schedule.description && (
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic">
                              {schedule.description}
                            </p>
                          )}
                          {schedule.meet_url && (
                            <a 
                              href={schedule.meet_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-gold hover:underline flex items-center gap-1 mt-2"
                            >
                              <MapPin size={12} />
                              Link da Reunião
                            </a>
                          )}
                          {schedule.invitedAdminId && (
                            <div className="flex items-center gap-2 text-[10px] bg-gold/5 text-gold-600 px-2 py-1 rounded-full w-fit mt-2">
                              <Users size={10} />
                              Com Admin: {schedule.InvitedAdmin?.name}
                            </div>
                          )}
                        </div>
                      )}

                      {schedule.isMasked && (
                        <p className="text-xs text-slate-400 mt-2">
                          Reservado para compromisso administrativo.
                        </p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Agendamento */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-[var(--bg-secondary)] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10"
              >
                <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                    <CalendarIcon className="text-gold" />
                    {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
                  </h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors text-[var(--text-secondary)]"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar-thin">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-[var(--text-secondary)] px-1">Título do Compromisso</label>
                      <input 
                        type="text"
                        className="input-premium"
                        placeholder="Ex: Reunião de Planejamento"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--text-secondary)] px-1">Data</label>
                      <input 
                        type="date"
                        className="input-premium"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-secondary)] px-1">Hora</label>
                        <input 
                          type="time"
                          className="input-premium"
                          value={formData.time}
                          onChange={e => setFormData({...formData, time: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--text-secondary)] px-1">Duração (min)</label>
                        <input 
                          type="number"
                          className="input-premium"
                          value={formData.duration}
                          onChange={e => setFormData({...formData, duration: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--text-secondary)] px-1">Cliente Cadastrado</label>
                      <select 
                        className="select-premium"
                        value={formData.clientId}
                        onChange={e => setFormData({...formData, clientId: e.target.value, clientName: ''})}
                      >
                        <option value="">Selecione um cliente (opcional)</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--text-secondary)] px-1">Ou Nome do Cliente</label>
                      <input 
                        type="text"
                        className="input-premium"
                        placeholder="Nome para cliente não cadastrado"
                        value={formData.clientName}
                        onChange={e => setFormData({...formData, clientName: e.target.value, clientId: ''})}
                        disabled={!!formData.clientId}
                      />
                    </div>

                    {user.role === 'partner' && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-[var(--text-secondary)] px-1">Convidar Administrador</label>
                        <select 
                          className="select-premium"
                          value={formData.invitedAdminId}
                          onChange={e => setFormData({...formData, invitedAdminId: e.target.value})}
                        >
                          <option value="">Nenhum (opcional)</option>
                          {partners.map(admin => (
                            <option key={admin.id} value={admin.id}>{admin.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-[var(--text-secondary)] px-1">Link da Reunião (Meet/Zoom)</label>
                      <input 
                        type="url"
                        className="input-premium"
                        placeholder="https://meet.google.com/..."
                        value={formData.meet_url}
                        onChange={e => setFormData({...formData, meet_url: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-[var(--text-secondary)] px-1">Descrição / Notas</label>
                      <textarea 
                        className="input-premium h-32 resize-none"
                        placeholder="Detalhes sobre a reunião..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-[var(--border-primary)]">
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      {editingSchedule ? 'Salvar Alterações' : 'Criar Agendamento'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </SystemLayout>
  );
};

export default Agenda;

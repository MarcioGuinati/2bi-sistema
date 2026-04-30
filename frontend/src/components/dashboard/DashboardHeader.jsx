import React from 'react';
import { Calendar, Target, Plus } from 'lucide-react';
import AnnouncementPanel from '../AnnouncementPanel';

const DashboardHeader = ({
  user,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  months,
  years,
  onOpenGoalModal
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">
            Bem-vindo, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-[var(--text-secondary)] font-medium tracking-tight">
            Visão estratégica e orçamentária do seu patrimônio.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-1.5 rounded-2xl shadow-sm mr-2">
            <div className="flex items-center gap-2 pl-3 text-gold">
              <Calendar size={16} />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent border-none outline-none text-xs font-bold text-[var(--text-primary)] cursor-pointer pr-4"
            >
              {months.map((m, i) => (
                <option key={m} value={i} className="bg-[var(--bg-secondary)]">
                  {m}
                </option>
              ))}
            </select>
            <div className="w-px h-4 bg-[var(--border-primary)]" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent border-none outline-none text-xs font-bold text-[var(--text-primary)] cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-[var(--bg-secondary)]">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenGoalModal}
            className="btn-primary flex items-center gap-2"
          >
            <Target size={20} /> Definir Orçamento
          </button>
          <a
            href="/finance"
            className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-6 py-3 rounded-2xl font-bold text-[var(--text-primary)] shadow-sm hover:bg-[var(--bg-primary)] flex items-center gap-2 transition-all font-medium text-sm"
          >
            <Plus size={18} /> Novo Lançamento
          </a>
        </div>
      </div>
      <AnnouncementPanel />
    </>
  );
};

export default DashboardHeader;

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const SystemLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-navy-900 flex items-center justify-between px-6 z-[60] shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center font-black text-navy-900 text-sm">2BI</div>
          <span className="text-white font-black text-xs tracking-tighter">PLANEJAMENTO</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white p-2 hover:bg-white/10 rounded-xl transition-all"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[45]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto mt-16 lg:mt-0">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SystemLayout;

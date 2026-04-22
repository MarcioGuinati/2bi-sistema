import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ImpersonationBanner from './ImpersonationBanner';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SystemLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isImpersonating } = useAuth();

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <ImpersonationBanner />

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-navy-900 flex items-center justify-between px-6 z-[60] shadow-lg">
        <div className="flex items-center">
          <img 
            src="/logo_2bi.png" 
            alt="2BI Planejamento" 
            className="h-8 w-auto object-contain"
          />
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
          className="lg:hidden fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[90]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto lg:pl-72 transition-all mt-16 lg:mt-0 ${isImpersonating ? 'lg:pt-12 pb-24 sm:pb-0' : ''}`}>
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SystemLayout;

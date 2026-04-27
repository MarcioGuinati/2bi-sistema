import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import ImpersonationBanner from './ImpersonationBanner';
import { useAuth } from '../context/AuthContext';

const SystemLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem('sidebar_collapsed') === 'true'
  );
  
  const { isImpersonating } = useAuth();

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', newState);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] overflow-hidden text-[var(--text-primary)]">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40 dark:opacity-20 transition-opacity duration-1000">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-gold/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[35vw] h-[35vw] bg-navy-900/5 dark:bg-gold/5 rounded-full blur-[100px]"></div>
      </div>

      <ImpersonationBanner />

      {/* Luxury Sidebar Portal (Works as Drawer on Mobile) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Mobile Glass Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-navy-900/80 backdrop-blur-md z-[120] transition-all duration-700"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Premium Content Stack */}
      <div className={`
        flex-1 flex flex-col min-w-0 h-screen transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative z-10
        ${isCollapsed ? 'lg:pl-[148px] lg:pr-8' : 'lg:pl-[328px] lg:pr-8'}
        ${isImpersonating ? 'pt-14' : ''}
      `}>
        <TopBar toggleMobileSidebar={() => setIsSidebarOpen(true)} />
        
        <main className={`flex-1 overflow-y-auto custom-scrollbar pb-32 lg:pb-12 pt-2 px-4 lg:px-0`}>
          <div className="max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            {children}
          </div>
        </main>

        {/* Adaptive Mobile Navigation Bar */}
        <MobileNav onOpenMenu={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
};

export default SystemLayout;

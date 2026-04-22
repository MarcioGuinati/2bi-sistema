import { useState, useEffect } from 'react';
import { Menu, X, Rocket, Shield, Users, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { signed, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Sobre', href: '#about' },
    { name: 'Sócios', href: '#partners' },
    { name: 'Serviços', href: '#services' },
    { name: 'Como Funciona', href: '#how-it-works' },
    { name: 'Contato', href: '#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)] py-3 shadow-lg' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center transition-all duration-300">
        <Link to="/" className="flex items-center group">
          <img 
            src="/logo_2bi.png" 
            alt="2BI Planejamento" 
            className={`h-auto transition-all duration-300 ${scrolled ? 'w-32' : 'w-40'}`}
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`font-bold text-xs uppercase tracking-widest transition-all relative group py-2 ${scrolled ? 'text-slate-600 hover:text-navy-900' : 'text-white/80 hover:text-white'}`}
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          {signed ? (
            <Link to="/panel" className="bg-navy-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all shadow-lg shadow-navy-900/10">
              Meu Painel
            </Link>
          ) : (
            <Link to="/login" className="bg-gold text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy-900 transition-all shadow-lg shadow-gold/20">
              Acesso Cliente
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-navy-900' : 'text-white'}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-[var(--bg-secondary)] backdrop-blur-xl border-b border-[var(--border-primary)] overflow-hidden md:hidden"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link, idx) => (
                <motion.a 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={link.name} 
                  href={link.href} 
                  className="text-navy-900 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-between group"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                  <Rocket size={14} className="text-gold opacity-0 group-hover:opacity-100 transition-all" />
                </motion.a>
              ))}
              <div className="pt-4 border-t border-[var(--border-primary)]">
                {signed ? (
                  <Link to="/panel" className="w-full btn-primary block text-center py-4 text-[10px] font-black uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                    Acessar Painel Estratégico
                  </Link>
                ) : (
                  <Link to="/login" className="w-full btn-primary block text-center py-4 text-[10px] font-black uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                    Área Restrita (Cliente)
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

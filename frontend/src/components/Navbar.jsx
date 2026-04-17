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
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-5 text-navy-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2">
          <motion.div 
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="text-gold font-bold text-3xl"
          >
            2BI
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="text-navy-900 font-heading font-bold text-xl tracking-tight">Planejamento</span>
            <span className="text-gold text-[10px] uppercase tracking-[0.2em] font-medium">Estratégia Financeira</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-navy-800 font-medium text-sm hover:text-gold transition-colors"
            >
              {link.name}
            </a>
          ))}
          {signed ? (
            <Link to="/panel" className="btn-primary py-2 px-5 text-sm">
              Meu Painel
            </Link>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-5 text-sm">
              Acesso Cliente
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-navy-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass md:hidden border-t border-navy-800/10"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-navy-900 font-medium text-lg border-b border-navy-800/5 pb-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              {signed ? (
                <Link to="/panel" className="btn-primary text-center mt-2" onClick={() => setIsOpen(false)}>
                  Meu Painel
                </Link>
              ) : (
                <Link to="/login" className="btn-primary text-center mt-2" onClick={() => setIsOpen(false)}>
                  Acesso Cliente
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

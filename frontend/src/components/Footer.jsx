import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gold font-bold text-3xl">2BI</span>
              <div className="flex flex-col leading-none">
                <span className="text-white font-heading font-bold text-xl tracking-tight">Planejamento</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Estratégia financeira para construir prosperidade com consistência. Onde os números encontram o propósito.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Navegação</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#about" className="hover:text-gold transition-colors">Sobre Nós</a></li>
              <li><a href="#services" className="hover:text-gold transition-colors">Serviços</a></li>
              <li><a href="#how-it-works" className="hover:text-gold transition-colors">Como Funciona</a></li>
              <li><a href="#contact" className="hover:text-gold transition-colors">Agendamento</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Serviços</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-gold transition-colors">Consultoria Pessoal</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Planejamento de Metas</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Proteção Patrimonial</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Wealth Management</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Redes Sociais</h4>
            <div className="flex flex-col gap-4 text-slate-400 text-sm">
              <a href="#" className="flex items-center gap-3 hover:text-gold transition-colors">
                <span>Instagram</span>
              </a>
              <a href="#" className="flex items-center gap-3 hover:text-gold transition-colors">
                <span>LinkedIn</span>
              </a>
              <a href="#" className="flex items-center gap-3 hover:text-gold transition-colors">
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs text-center md:text-left">
            © {new Date().getFullYear()} 2BI Planejamento Financeiro. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-slate-500 text-xs">
            <a href="#" className="hover:text-white">Política de Privacidade</a>
            <a href="#" className="hover:text-white">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

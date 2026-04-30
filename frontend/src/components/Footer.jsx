import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          <div className="col-span-1 lg:col-span-1">
            <div className="mb-6">
              <img 
                src="/logo_2bi.png" 
                alt="2BI Planejamento" 
                className="w-32 h-auto"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Estratégia financeira para construir prosperidade com consistência. Inteligência patrimonial para quem busca liberdade.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Navegação</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#about" className="hover:text-gold transition-colors">Sobre Nós</a></li>
              <li><a href="#services" className="hover:text-gold transition-colors">Serviços</a></li>
              <li><a href="#how-it-works" className="hover:text-gold transition-colors">Como Funciona</a></li>
              <li><a href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1Af9SGv5_3pZ4ZNYkwur4mbWBNFHIenWpyA3ntS0VuB8F-UzzKj2Wt3X0tk4NrJtHfwrQv7W2y?gv=true" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Agendamento</a></li>
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
              <a href="https://wa.me/5516992415924" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-gold transition-colors">
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
            <a href="/privacy-policy" className="hover:text-white transition-colors">Política de Privacidade</a>
            <a href="/terms" className="hover:text-white transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

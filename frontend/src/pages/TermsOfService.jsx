import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar solid={true} />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] p-10 md:p-16 shadow-2xl border border-[var(--border-primary)]">
          <h1 className="text-4xl font-black font-heading text-[var(--text-primary)] mb-8">Termos de Serviço</h1>
          
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">1. Termos</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Ao acessar ao site 2BI Planejamento, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">2. Uso de Licença</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site 2BI Planejamento, apenas para visualização transitória pessoal e não comercial.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">3. Isenção de Responsabilidade</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Os materiais no site da 2BI Planejamento são fornecidos 'como estão'. 2BI Planejamento não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">4. Limitações</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Em nenhum caso a 2BI Planejamento ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em 2BI Planejamento.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">5. Precisão dos Materiais</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Os materiais exibidos no site da 2BI Planejamento podem incluir erros técnicos, tipográficos ou fotográficos. 2BI Planejamento não garante que qualquer material em seu site seja preciso, completo ou atual.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">6. Links</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            A 2BI Planejamento não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por 2BI Planejamento do site.
          </p>

          <div className="mt-12 pt-8 border-t border-[var(--border-primary)]">
            <p className="text-xs text-slate-400 uppercase font-black tracking-widest">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;

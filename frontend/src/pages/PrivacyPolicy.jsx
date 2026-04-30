import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar solid={true} />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="bg-[var(--bg-secondary)] rounded-[2.5rem] p-10 md:p-16 shadow-2xl border border-[var(--border-primary)]">
          <h1 className="text-4xl font-black font-heading text-[var(--text-primary)] mb-8">Política de Privacidade</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            A sua privacidade é importante para nós. É política da 2BI Planejamento respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site 2BI Planejamento, e outros sites que possuímos e operamos.
          </p>
          
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">1. Coleta de Informações</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">2. Uso de Dados</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">3. Compartilhamento de Informações</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">4. Cookies</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Nosso site pode usar cookies para melhorar a experiência do usuário. Você pode optar por desativar os cookies em seu navegador, embora isso possa afetar algumas funcionalidades do site.
          </p>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">5. Seus Direitos</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados. O uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais.
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

export default PrivacyPolicy;

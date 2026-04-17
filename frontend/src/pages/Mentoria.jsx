import React from 'react';
import SystemLayout from '../components/SystemLayout';

const Mentoria = () => {
  return (
    <SystemLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Agendamento de Mentoria</h1>
          <p className="text-[var(--text-secondary)] font-medium tracking-tight">Escolha o melhor horário para alinharmos sua estratégia rumo ao bilhão.</p>
        </div>

        <div className="card-premium p-4 overflow-hidden min-h-[700px]">
          <iframe 
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1Af9SGv5_3pZ4ZNYkwur4mbWBNFHIenWpyA3ntS0VuB8F-UzzKj2Wt3X0tk4NrJtHfwrQv7W2y?gv=true" 
            style={{ border: 0 }} 
            width="100%" 
            height="700" 
            frameBorder="0"
          ></iframe>
        </div>
      </div>
    </SystemLayout>
  );
};

export default Mentoria;

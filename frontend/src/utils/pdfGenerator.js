import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const generateContractPDF = async (contract, user, type = 'client') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Background / Watermark
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.text('2BI PLANEJAMENTO', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
  doc.restoreGraphicsState();

  // 2. Premium Header Bar
  doc.setFillColor(10, 25, 47); // Navy 900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // 2.1 Logo
  try {
    const logo = await preloadImage('/logo_2bi.png');
    doc.addImage(logo, 'PNG', 20, 8, 20, 20);
  } catch (err) {
    console.error('Erro ao carregar logo para o PDF:', err);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const title = type === 'client' ? 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS' : 'INSTRUMENTO DE PARCERIA COMERCIAL';
  doc.text(title, 45, 25);

  doc.setTextColor(197, 160, 89); // Gold
  doc.setFontSize(8);
  doc.text('ESTRATÉGIA • PATRIMÔNIO • INTELIGÊNCIA FINANCEIRA', 45, 32);

  // 3. Document ID / Date
  doc.setTextColor(100, 116, 139); // Slate 400
  doc.setFontSize(7);
  const docId = `REF: 2BI-${Date.now().toString().slice(-6)}`;
  doc.text(docId, pageWidth - 20, 15, { align: 'center' });
  doc.text(`GERADO EM: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 20, 20, { align: 'center' });

  let y = 60;

  // 4. Section: PARTES
  doc.setDrawColor(197, 160, 89); // Gold
  doc.setLineWidth(0.5);
  doc.line(20, y, 40, y);

  doc.setTextColor(10, 25, 47);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('I. DAS PARTES', 20, y + 8);

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  doc.text('CONTRATADA:', 20, y);
  doc.setFont('helvetica', 'bold');
  doc.text('2BI PLANEJAMENTO ESTRATÉGICO LTDA', 50, y);
  doc.setFont('helvetica', 'normal');
  doc.text('CNPJ: 57.967.874/0001-30', 50, y + 5);

  y += 15;
  doc.text(type === 'client' ? 'CONTRATANTE:' : 'PARCEIRO:', 20, y);
  doc.setFont('helvetica', 'bold');
  doc.text(user.name.toUpperCase(), 50, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`CPF: ${user.cpf || 'NÃO INFORMADO'} | E-mail: ${user.email}`, 50, y + 5);

  if (type === 'client') {
    // Logic for Client Contract (Existing)
    y += 25;
    doc.line(20, y, 40, y);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 25, 47);
    doc.text('II. DO OBJETO', 20, y + 8);

    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const objetoText = `O presente instrumento tem por objeto a prestação de serviços especializados de ${contract.title.toUpperCase()}, visando a otimização de fluxos, organização de ativos e o alinhamento estratégico reportado nas sessões de mentoria.`;
    const objectLines = doc.splitTextToSize(objetoText, pageWidth - 40);
    doc.text(objectLines, 20, y);

    y += 30;
    doc.line(20, y, 40, y);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 25, 47);
    doc.text('III. VALORES E CONDIÇÕES', 20, y + 8);

    y += 18;
    const hasSetup = Number(contract.setupValue) > 0;
    const hasMonthly = Number(contract.monthlyValue) > 0;

    if (hasSetup) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, y - 5, (pageWidth - 40) / (hasMonthly ? 2.1 : 1), 25, 3, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Valor Projeto:', 30, y + 5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(197, 160, 89);
      doc.text(`R$ ${Number(contract.setupValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 30, y + 13);
    }

    if (hasMonthly) {
      const startX = hasSetup ? (pageWidth / 2) + 5 : 20;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(startX, y - 5, (pageWidth - 40) / (hasSetup ? 2.1 : 1), 25, 3, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(10, 25, 47);
      doc.text(`Mensalidade (${contract.recurrence} Meses):`, startX + 10, y + 5);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(197, 160, 89);
      doc.text(`R$ ${Number(contract.monthlyValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, startX + 10, y + 13);
    }
  } else {
    // Logic for Partner Contract (New)
    const clauses = [
      {
        title: '1. MODELO DE PARCERIA',
        content: 'A parceria com a 2Bi Planejamento é estabelecida como uma relação comercial autônoma, sem qualquer vínculo empregatício. O parceiro atua de forma independente, com liberdade para definir seus próprios horários, escolher sua forma de atuação e organizar sua rotina de trabalho. Não há controle de jornada, subordinação direta ou obrigação de cumprimento de carga horária.'
      },
      {
        title: '2. ESTRUTURA DE EVOLUÇÃO',
        content: 'O parceiro poderá evoluir dentro da operação conforme desempenho e capacitação:\n• NÍVEL 1 (HUNTER): Prospecção e geração de oportunidades.\n• NÍVEL 2 (CLOSER): Condução de reuniões e fechamento.\n• NÍVEL 3 (PLANEJADOR): Execução e acompanhamento estratégico.'
      },
      {
        title: '3. COMISSIONAMENTO - PROJETOS',
        content: 'As comissões são calculadas sobre o valor líquido do contrato:\n• Hunter: 40%\n• Closer: 50% (se prospectar) ou 10% (se apenas fechar)\n• Planejador: 60% (se fizer tudo) ou 10% (se apenas acompanhar).'
      },
      {
        title: '4. COMISSIONAMENTO - ASSINATURAS',
        content: 'Para planos do app: Dono do cliente recebe 10% da mensalidade de forma vitalícia enquanto o cliente estiver ativo, independentemente de quem realize o atendimento posterior.'
      },
      {
        title: '5. TREINAMENTO',
        content: 'A empresa disponibilizará 1 a 2 treinamentos semanais em prospecção, abordagem e fechamento. A participação é recomendada mas não obrigatória.'
      },
      {
        title: '6. MATERIAL E ÉTICA',
        content: 'O parceiro utilizará materiais oficiais fornecidos via Drive. É proibido criar materiais próprios sem autorização ou prometer condições não autorizadas. O parceiro deve agir com ética, transparência e não pode se apresentar como funcionário CLT.'
      },
      {
        title: '7. RESCISÃO',
        content: 'A parceria poderá ser encerrada a qualquer momento por ambas as partes, sem necessidade de justificativa formal.'
      }
    ];

    y += 25;
    clauses.forEach((clause) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 30;
      }
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.3);
      doc.line(20, y, 35, y);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 25, 47);
      doc.text(clause.title, 20, y + 6);
      
      y += 12;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(clause.content, pageWidth - 40);
      doc.text(lines, 20, y);
      y += (lines.length * 5) + 10;
    });
  }

  // 7. Signatures
  if (y > pageHeight - 60) {
    doc.addPage();
    y = 60;
  } else {
    y = pageHeight - 60;
  }
  
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 90, y);
  doc.line(120, y, pageWidth - 20, y);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(user.name, 55, y + 5, { align: 'center' });
  doc.text(type === 'client' ? 'Contratante' : 'Parceiro', 55, y + 10, { align: 'center' });

  doc.text('2BI PLANEJAMENTO', 155, y + 5, { align: 'center' });
  doc.text('Contratada', 155, y + 10, { align: 'center' });

  // 8. Footer
  doc.setFillColor(10, 25, 47);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('2BI PLANEJAMENTO ESTRATÉGICO FINANCEIRO - WWW.2BI.ORIONCHAT.CLOUD', pageWidth / 2, pageHeight - 7, { align: 'center' });

  return doc;
};

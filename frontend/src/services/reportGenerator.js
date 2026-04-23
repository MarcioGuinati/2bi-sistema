import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

/**
 * Premium Report Generator Service
 * Creates a high-end financial report PDF
 */
class ReportGenerator {
  constructor() {
    this.primaryColor = [15, 23, 42]; // Dark Navy (#0f172a)
    this.accentColor = [251, 191, 36]; // Gold (#fbbf24)
    this.textColor = [30, 41, 59];
    this.secondaryTextColor = [100, 116, 139];
  }

  generateStrategicReport(data) {
    const { user, summary, transactions, categories, goals, period, consultant_note } = data;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // --- Header ---
    doc.setFillColor(...this.primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Logo / Brand
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('2BI', margin, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PLANEJAMENTO FINANCEIRO', margin, 32);

    // Report Title & User
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO ESTRATÉGICO', pageWidth - margin, 25, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${user.name}`, pageWidth - margin, 32, { align: 'right' });
    
    const periodText = period.start && period.end 
      ? `Período: ${format(new Date(period.start), 'dd/MM/yyyy')} a ${format(new Date(period.end), 'dd/MM/yyyy')}`
      : 'Visão Geral do Período';
    doc.text(periodText, pageWidth - margin, 37, { align: 'right' });

    let currentY = 60;

    // --- Executive Summary Section ---
    doc.setTextColor(...this.primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. RESUMO EXECUTIVO', margin, currentY);
    
    currentY += 10;
    
    // Summary Cards (Drawn as boxes)
    const cardWidth = (pageWidth - (margin * 2) - 10) / 3;
    const cardHeight = 25;

    // Receitas
    this._drawSummaryCard(doc, margin, currentY, cardWidth, cardHeight, 'RECEITA MENSAL', `R$ ${summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, [34, 197, 94]);
    
    // Despesas
    this._drawSummaryCard(doc, margin + cardWidth + 5, currentY, cardWidth, cardHeight, 'DESPESA MENSAL', `R$ ${summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, [239, 68, 68]);

    // Saldo
    this._drawSummaryCard(doc, margin + (cardWidth * 2) + 10, currentY, cardWidth, cardHeight, 'SALDO NO PERÍODO', `R$ ${summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, this.primaryColor);

    currentY += 40;

    // --- Category Breakdown Section ---
    doc.setTextColor(...this.primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. ANÁLISE POR CATEGORIA (MAIORES GASTOS)', margin, currentY);

    currentY += 8;

    const categoryRows = categories.map(cat => [
      cat.name,
      `R$ ${cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `${((cat.value / summary.expense) * 100 || 0).toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Categoria', 'Valor', 'Representatividade']],
      body: categoryRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: this.primaryColor, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: (data) => {
        currentY = data.cursor.y;
      }
    });

    currentY += 15;

    // Check for page overflow
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = margin;
    }

    // --- Goals Section ---
    doc.setTextColor(...this.primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. OBJETIVOS E METAS', margin, currentY);

    currentY += 8;

    const goalRows = goals.map(goal => [
      goal.title,
      `R$ ${goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `${((goal.currentAmount / goal.targetAmount) * 100 || 0).toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Objetivo', 'Meta', 'Acumulado', 'Progresso']],
      body: goalRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: this.primaryColor, textColor: 255, fontStyle: 'bold' },
      didDrawPage: (data) => {
        currentY = data.cursor.y;
      }
    });

    currentY += 20;

    // --- Strategic Insights ---
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFillColor(254, 251, 232); // Light yellow for insights
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 30, 3, 3, 'F');
    
    doc.setTextColor(...this.primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const adviceTitle = consultant_note ? 'PARECER DO CONSULTOR' : 'ANÁLISE AUTOMÁTICA DO SISTEMA';
    doc.text(adviceTitle, margin + 5, currentY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    let advice = "";
    if (consultant_note) {
      advice = consultant_note;
    } else if (summary.balance > 0) {
      advice = "Excelente desempenho no período analisado. O saldo positivo permite acelerar o aporte nos objetivos de longo prazo.";
    } else {
      advice = "Atenção ao fluxo de caixa. O volume de despesas superou as receitas. Recomendamos a revisão das categorias com maior representatividade.";
    }
    
    doc.text(advice, margin + 5, currentY + 20, { maxWidth: pageWidth - (margin * 2) - 10 });

    // --- Footer ---
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(...this.secondaryTextColor);
    doc.text('2BI Planejamento Financeiro - www.2bi.com.br', margin, footerY);
    doc.text(`Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth - margin, footerY, { align: 'right' });

    // --- Download ---
    doc.save(`Relatorio_Estrategico_${user.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  }

  _drawSummaryCard(doc, x, y, width, height, label, value, color) {
    // Card Shadow-ish
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x + 0.5, y + 0.5, width, height, 2, 2, 'F');
    
    // Main Card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, width, height, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, width, height, 2, 2, 'S');

    // Accent line
    doc.setFillColor(...color);
    doc.rect(x + 5, y + 5, 2, 6, 'F');

    // Content
    doc.setTextColor(...this.secondaryTextColor);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + 10, y + 10);

    doc.setTextColor(...this.primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(value, x + 10, y + 20);
  }
}

export default new ReportGenerator();

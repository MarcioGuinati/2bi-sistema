const { Transaction, Goal, Category, Account, Setting, Insight, sequelize } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

class AIController {
  async getInsights(req, res) {
    try {
      const { month, year } = req.query;
      const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
      const targetYear = year ? parseInt(year) : new Date().getFullYear();

      // 1. Get AI Settings
      const settings = await Setting.findAll({
        where: { key: ['openai_key', 'openai_model', 'ai_system_prompt'] }
      });

      const config = {};
      settings.forEach(s => config[s.key] = s.value);

      if (!config.openai_key) {
        return res.status(400).json({ error: 'Integração com IA não configurada pelo administrador.' });
      }

      // 2. Gather User Data for selected month
      const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

      // Transactions summarized by category
      const transactions = await Transaction.findAll({
        where: {
          user_id: req.userId,
          date: { [Op.between]: [startDate, endDate] }
        },
        include: [{ model: Category, attributes: ['name', 'type'] }],
        attributes: [
          'category_id',
          [sequelize.fn('sum', sequelize.col('amount')), 'total'],
          [sequelize.col('Category.type'), 'type']
        ],
        group: ['category_id', 'Category.id', 'Category.name', 'Category.type'],
        raw: true
      });

      let totalIncome = 0;
      let totalExpenses = 0;
      const incomeCategories = [];
      const expenseCategories = [];

      transactions.forEach(t => {
        const total = parseFloat(t.total);
        const name = t['Category.name'];
        const type = t['Category.type'];
        
        if (type === 'income') {
          totalIncome += total;
          incomeCategories.push(`${name}: R$ ${total.toLocaleString('pt-BR')}`);
        } else {
          totalExpenses += total;
          expenseCategories.push(`${name}: R$ ${total.toLocaleString('pt-BR')}`);
        }
      });

      // Goals/Budgets
      const goals = await Goal.findAll({
        where: { user_id: req.userId },
        include: [{ model: Category, attributes: ['name'] }],
        raw: true
      });

      // Total balances
      const accounts = await Account.findAll({
        where: { user_id: req.userId }
      });

      const monthName = new Date(targetYear, targetMonth - 1, 1).toLocaleString('pt-BR', { month: 'long' });
      const balance = totalIncome - totalExpenses;

      // 3. Call OpenAI
      const systemPrompt = config.ai_system_prompt || 'Você é um assistente financeiro pessoal de elite da 2BI Planejamento. Sua missão é dar clareza e direção financeira.';
      
      const userPrompt = `### RELATÓRIO FINANCEIRO DE ${monthName.toUpperCase()}/${targetYear} ###

VALORES CONSOLIDADOS (NÃO RECALCULE ESTES VALORES, USE ESTES EXATAMENTE):
- ENTRADAS DO MÊS: R$ ${totalIncome.toLocaleString('pt-BR')}
- SAÍDAS TOTAIS: R$ ${totalExpenses.toLocaleString('pt-BR')}
- SALDO FINAL: R$ ${balance.toLocaleString('pt-BR')}

DETALHAMENTO DE ENTRADAS:
${incomeCategories.length > 0 ? incomeCategories.join('\n') : 'Nenhuma receita registrada.'}

DETALHAMENTO DE SAÍDAS POR CATEGORIA:
${expenseCategories.length > 0 ? expenseCategories.join('\n') : 'Nenhuma despesa registrada.'}

METAS E ORÇAMENTOS DEFINIDOS:
${goals.map(g => `- ${g.title} (Categoria ${g['Category.name']}): Limite R$ ${parseFloat(g.targetAmount).toLocaleString('pt-BR')}`).join('\n')}

---
TAREFA:
Analise os dados acima. Se o saldo for positivo, parabenize. Se for negativo, mostre onde está o problema. 
Identifique especificamente se alguma categoria de SAÍDA ultrapassou o orçamento (META) definido.
Forneça 3 dicas práticas para melhorar os resultados. 

Responda em Markdown, use títulos claros e seja muito preciso com os números fornecidos.`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: config.openai_model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3 // Lower temperature for more precision
      }, {
        headers: {
          'Authorization': `Bearer ${config.openai_key}`,
          'Content-Type': 'application/json'
        }
      });

      const insightContent = response.data.choices[0].message.content;

      // 4. Save to History
      const insight = await Insight.create({
        user_id: req.userId,
        month: targetMonth,
        year: targetYear,
        content: insightContent
      });

      return res.json(insight);

    } catch (error) {
      console.error('AI Insights Error:', error.response?.data || error.message);
      const msg = error.response?.data?.error?.message || 'Erro ao processar insights com IA';
      return res.status(500).json({ error: msg });
    }
  }

  async listInsights(req, res) {
    try {
      const { page = 1, limit = 5 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await Insight.findAndCountAll({
        where: { user_id: req.userId },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return res.json({
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        insights: rows
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar histórico de insights' });
    }
  }

  async deleteInsight(req, res) {
    try {
      const { id } = req.params;
      await Insight.destroy({
        where: { id, user_id: req.userId }
      });
      return res.json({ message: 'Insight removido com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover insight' });
    }
  }
}

module.exports = new AIController();

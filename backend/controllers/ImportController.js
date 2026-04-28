const { parse } = require('ofx-js');
const { Transaction, Setting, Category, Insight } = require('../models');
const axios = require('axios');

class ImportController {
  async preview(req, res) {
    try {
      const { account_id } = req.body;
      const file = req.file;

      if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

      const ofxContent = file.buffer.toString('latin1');
      const data = await parse(ofxContent);

      const findTransactions = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        if (obj.STMTTRN) return Array.isArray(obj.STMTTRN) ? obj.STMTTRN : [obj.STMTTRN];
        for (const key in obj) {
          const result = findTransactions(obj[key]);
          if (result) return result;
        }
        return null;
      };

      const transactions = findTransactions(data) || [];
      const processed = [];

      for (const t of transactions) {
        const amount = parseFloat(t.TRNAMT);
        const external_id = t.FITID ? `${account_id}_${t.FITID}` : null;
        const description = t.MEMO || t.NAME;
        const rawDate = t.DTPOSTED || t.DTUSER;
        
        if (!rawDate) continue;
        const formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;

        // Check for duplicate in DB
        const exists = external_id ? await Transaction.findOne({ where: { external_id, user_id: req.userId } }) : null;

        processed.push({
          amount: Math.abs(amount),
          description: description ? description.trim() : 'Transação Bancária',
          type: amount < 0 ? 'expense' : 'income',
          date: formattedDate,
          external_id,
          isDuplicate: !!exists
        });
      }

      // AI Categorization
      try {
        const settings = await Setting.findAll({
          where: { key: ['openai_key', 'openai_model'] }
        });
        const config = {};
        settings.forEach(s => config[s.key] = s.value);

        if (config.openai_key && processed.length > 0) {
          const categories = await Category.findAll({ where: { user_id: req.userId }, raw: true });
          if (categories.length > 0) {
            const categoriesMap = categories.map(c => `ID: ${c.id} - ${c.name}`).join('\n');
            const descriptionsMap = processed.map((t, idx) => `ID_TRANSACAO: ${idx} - Descrição: ${t.description} - Tipo: ${t.type}`).join('\n');

            const systemPrompt = `Você é um assistente financeiro especialista em categorizar transações. 
            Mapeie cada transação fornecida para a ID da categoria mais adequada com base nas categorias do usuário.
            
            Retorne APENAS um JSON válido no formato:
            {
              "categorias": [
                { "id_transacao": 0, "category_id": "123e4567-e89b-12d3-a456-426614174000" },
                { "id_transacao": 1, "category_id": null }
              ]
            }
            Se não tiver certeza absoluta, use null.
            
            CATEGORIAS DISPONÍVEIS:
            ${categoriesMap}`;

            const userPrompt = `TRANSAÇÕES:\n${descriptionsMap}`;

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
              model: config.openai_model || 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.1,
              response_format: { type: 'json_object' }
            }, {
              headers: {
                'Authorization': `Bearer ${config.openai_key}`,
                'Content-Type': 'application/json'
              }
            });

            const content = response.data.choices[0].message.content;
            const parsedContent = JSON.parse(content);
            const mapping = parsedContent.categorias || [];

            let categorizedCount = 0;

            mapping.forEach(m => {
              if (processed[m.id_transacao]) {
                processed[m.id_transacao].category_id = m.category_id || null;
                if (m.category_id) categorizedCount++;
              }
            });

            const now = new Date();
            await Insight.create({
              user_id: req.userId,
              month: now.getMonth() + 1,
              year: now.getFullYear(),
              content: `Categorização OFX via IA: ${processed.length} transações analisadas, ${categorizedCount} mapeadas.`
            });
          }
        }
      } catch (aiError) {
        console.error('Erro ao categorizar com IA no OFX:', aiError.response?.data || aiError.message);
      }

      return res.json(processed);
    } catch (error) {
      console.error('Erro no preview OFX:', error);
      return res.status(500).json({ error: 'Falha ao processar arquivo OFX.' });
    }
  }

  async confirm(req, res) {
    try {
      const { account_id, transactions } = req.body;

      if (!transactions || !Array.isArray(transactions)) {
        return res.status(400).json({ error: 'Dados inválidos' });
      }

      const cleanTransactions = transactions.map((t, idx) => {
        const { isDuplicate, ...cleanData } = t;
        
        // If it's flagged as duplicate, modify the external_id to satisfy DB constraints
        // while still allowing the import to happen as requested.
        const suffix = `_manual_${Date.now()}_${idx}`;
        const finalExternalId = cleanData.external_id ? (isDuplicate ? `${cleanData.external_id}${suffix}` : cleanData.external_id) : null;

        return {
          ...cleanData,
          external_id: finalExternalId,
          account_id,
          user_id: req.userId,
          is_paid: true
        };
      });

      const created = await Transaction.bulkCreate(cleanTransactions);

      return res.json({ 
        message: 'Importação concluída', 
        imported: created.length
      });
    } catch (error) {
      console.error('Erro ao confirmar importação:', error);
      return res.status(500).json({ error: 'Falha ao salvar transações. Verifique se há duplicatas ou dados inválidos.' });
    }
  }

  async textPreview(req, res) {
    try {
      const { account_id, text } = req.body;
      if (!text) return res.status(400).json({ error: 'Nenhum texto enviado' });

      const settings = await Setting.findAll({
        where: { key: ['openai_key', 'openai_model'] }
      });
      const config = {};
      settings.forEach(s => config[s.key] = s.value);

      if (!config.openai_key) {
        return res.status(400).json({ error: 'Integração com IA não configurada. Configure no painel Admin.' });
      }

      const categories = await Category.findAll({ where: { user_id: req.userId }, raw: true });
      const categoriesMap = categories.length > 0 ? categories.map(c => `ID: ${c.id} - ${c.name}`).join('\n') : 'Nenhuma categoria cadastrada.';

      const systemPrompt = `Você é um assistente financeiro especialista em extrair transações bancárias de texto bruto copiado de extratos.
      Extraia cada transação identificando Data (no formato YYYY-MM-DD), Valor (sempre positivo), Descrição original e Tipo (income ou expense).
      Além disso, tente mapear para a melhor Categoria do usuário. Se não tiver certeza, category_id será null.

      Retorne APENAS um JSON válido no formato:
      {
        "transacoes": [
          {
            "date": "2023-10-05",
            "amount": 150.50,
            "description": "COMPRA SUPERMERCADO",
            "type": "expense",
            "category_id": "123e4567-e89b-12d3-a456-426614174000"
          }
        ]
      }
      Se o texto não contiver transações válidas, retorne "transacoes": [].
      
      CATEGORIAS DISPONÍVEIS:
      ${categoriesMap}`;

      const userPrompt = `TEXTO BRUTO DO EXTRATO:\n${text}`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: config.openai_model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${config.openai_key}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      const extracted = parsedContent.transacoes || [];

      const processed = [];
      for (const t of extracted) {
        processed.push({
          amount: Math.abs(t.amount || 0),
          description: t.description || 'Transação Extraída',
          type: t.type || 'expense',
          date: t.date || new Date().toISOString().split('T')[0],
          external_id: null,
          category_id: t.category_id || null,
          isDuplicate: false
        });
      }

      const now = new Date();
      await Insight.create({
        user_id: req.userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        content: `Extração de Texto via IA: ${text.length} caracteres analisados, ${processed.length} transações extraídas.`
      });

      return res.json(processed);
    } catch (error) {
      console.error('Erro no preview Texto:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Falha ao processar texto bruto com IA.' });
    }
  }
}

module.exports = new ImportController();

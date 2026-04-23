const { parse } = require('ofx-js');
const { Transaction } = require('../models');

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
}

module.exports = new ImportController();

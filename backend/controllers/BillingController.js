const { Contract, Payment, User } = require('../models');
const AssinafyService = require('../services/AssinafyService');

class BillingController {
  async handleAssinafyWebhook(req, res) {
    try {
      const { event, document } = req.body;
      console.log('Webhook Assinafy Recebido:', event);

      // Se o documento foi assinado por todos (ou conforme o evento da doc)
      if (document && document.id) {
        const contract = await Contract.findOne({ where: { signature_id: document.id } });
        
        if (contract) {
          // Atualiza status baseado no que vem da Assinafy
          // Geralmente o status de finalizado é 'closed' ou 'signed'
          const isSigned = document.status === 'closed' || document.status === 'signed';
          
          await contract.update({
            signature_status: isSigned ? 'signed' : 'pending',
            signedAt: isSigned ? new Date() : null,
            // Se a Assinafy enviar a URL do PDF assinado em artifacts.original ou similar
            signature_url: document.artifacts?.signed || document.artifacts?.original
          });
          
          console.log(`Contrato ${contract.id} atualizado via Webhook para: ${contract.signature_status}`);
        }
      }

      return res.status(200).send('OK');
    } catch (err) {
      console.error('Erro no Webhook Assinafy:', err);
      return res.status(500).send('Error');
    }
  }

  async getSignatureStatus(req, res) {
    try {
      const { id } = req.params;
      const contract = await Contract.findByPk(id);

      if (!contract || !contract.signature_id) {
        return res.status(400).json({ error: 'Este contrato não possui uma assinatura vinculada.' });
      }

      const doc = await AssinafyService.checkDocumentStatus(contract.signature_id);

      if (doc) {
        // Status do documento na Assinafy
        const isSigned = doc.status === 'closed' || doc.status === 'signed';
        
        await contract.update({
          signature_status: isSigned ? 'signed' : 'pending',
          signedAt: isSigned ? new Date() : null,
          signature_url: doc.artifacts?.signed || doc.artifacts?.original
        });
      }

      return res.json({ status: contract.signature_status, contract });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao verificar status na Assinafy' });
    }
  }

  async sendToAssinafy(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem enviar contratos para assinatura' });
    }

    try {
      const { id } = req.params;
      const { documentBase64 } = req.body;
      const contract = await Contract.findByPk(id, {
        include: [{ model: User, attributes: ['id', 'name', 'email'] }]
      });

      if (!contract) return res.status(404).json({ error: 'Contrato não encontrado' });
      if (!documentBase64) return res.status(400).json({ error: 'O PDF não foi enviado para assinatura.' });

      const result = await AssinafyService.sendContractForSignature(contract, contract.User, documentBase64);

      // Save Assinafy ID and update status
      await contract.update({
        signature_id: result.id,
        signature_status: 'pending'
      });

      return res.json({ message: 'Contrato enviado para assinatura com sucesso!', result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || 'Erro ao integrar com Assinafy' });
    }
  }

  async listContracts(req, res) {
    try {
      const { userId } = req.params;

      if (req.userRole === 'partner') {
        const client = await User.findByPk(userId);
        if (!client || String(client.partner_id) !== String(req.userId)) {
          return res.status(403).json({ error: 'Não autorizado: Cliente não pertence a você' });
        }
      } else if (req.userRole !== 'admin' && String(req.userId) !== String(userId)) {
        return res.status(403).json({ error: 'Não autorizado' });
      }

      const contracts = await Contract.findAll({
        where: { user_id: userId },
        include: [{ model: Payment, order: [['dueDate', 'ASC']] }],
        order: [['createdAt', 'DESC']]
      });
      return res.json(contracts);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar contratos' });
    }
  }

  async storeContract(req, res) {
    try {
      const { 
        user_id, title, setupValue = 0, monthlyValue = 0, 
        billingCycle, startDate, recurrence = 1,
        hasReportAccess, hasAIAccess, url
      } = req.body;
      
      // Calculate total value for display (Setup + first month if any)
      const totalValue = Number(setupValue) + Number(monthlyValue);

      const contract = await Contract.create({
        user_id,
        title,
        value: totalValue,
        setupValue,
        monthlyValue,
        recurrence,
        billingCycle,
        startDate: startDate || new Date(),
        status: 'active',
        hasReportAccess: hasReportAccess || false,
        hasAIAccess: hasAIAccess || false,
        url
      });

      // Automatically generate the requested number of payments
      const payments = [];
      const start = startDate ? new Date(startDate) : new Date();

      // 1. Setup Payment
      if (Number(setupValue) > 0) {
        payments.push({
          user_id,
          contract_id: contract.id,
          amount: setupValue,
          dueDate: start,
          status: 'pending',
          description: `Setup/Implementação - ${title}`
        });
      }

      // 2. Monthly/Recurring Payments
      if (Number(monthlyValue) > 0) {
        for (let i = 0; i < recurrence; i++) {
          const dueDate = new Date(start);
          dueDate.setMonth(start.getMonth() + i);

          payments.push({
            user_id,
            contract_id: contract.id,
            amount: monthlyValue,
            dueDate,
            status: 'pending',
            description: recurrence > 1 ? `${title} (Mensalidade ${i + 1}/${recurrence})` : `${title} (Mensalidade)`
          });
        }
      }

      if (payments.length > 0) {
        await Payment.bulkCreate(payments);
      }

      return res.json(contract);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: 'Erro ao criar contrato e faturamento unificado' });
    }
  }

  async updateContract(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem gerenciar contratos' });
    }
    try {
      const { id } = req.params;
      const { 
        title, value, billingCycle, startDate,
        hasReportAccess, hasAIAccess, url
      } = req.body;
      const contract = await Contract.findByPk(id);
      
      if (!contract) return res.status(404).json({ error: 'Contrato não encontrado' });

      await contract.update({ 
        title, value, billingCycle, startDate, 
        hasReportAccess, hasAIAccess, url
      });
      return res.json(contract);
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao atualizar contrato' });
    }
  }

  async deleteContract(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem excluir contratos' });
    }
    try {
      const { id } = req.params;
      // Payments will be deleted by cascade or manually
      await Payment.destroy({ where: { contract_id: id } });
      await Contract.destroy({ where: { id } });
      return res.send();
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao excluir contrato' });
    }
  }

  async markPaymentAsPaid(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem baixar pagamentos' });
    }
    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(id);
      
      if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado' });

      await payment.update({
        status: 'paid',
        paidAt: new Date()
      });

      return res.json(payment);
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao processar pagamento' });
    }
  }

  async markPaymentAsPending(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem estornar pagamentos' });
    }
    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(id);
      
      if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado' });

      await payment.update({
        status: 'pending',
        paidAt: null
      });

      return res.json(payment);
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao estornar pagamento' });
    }
  }

  // Get all payments for a specific user (Billing History)
  async listPayments(req, res) {
    try {
      const { userId } = req.params;

      if (req.userRole === 'partner') {
        const client = await User.findByPk(userId);
        if (!client || String(client.partner_id) !== String(req.userId)) {
          return res.status(403).json({ error: 'Não autorizado: Cliente não pertence a você' });
        }
      } else if (req.userRole !== 'admin' && String(req.userId) !== String(userId)) {
        return res.status(403).json({ error: 'Não autorizado' });
      }

      const payments = await Payment.findAll({
        where: { user_id: userId },
        include: [{ model: Contract }],
        order: [['dueDate', 'ASC']]
      });
      return res.json(payments);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar pagamentos' });
    }
  }

  // Get all payments from ALL users (Admin Overview)
  async listAllPayments(req, res) {
    try {
      const { startDate, endDate, status } = req.query;
      const { Op } = require('sequelize');
      const where = {};

      if (status) where.status = status;
      if (startDate && endDate) {
        where.dueDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      // If partner, only show their clients
      const userWhere = { role: 'client' };
      if (req.userRole === 'partner') {
        userWhere.partner_id = req.userId;
      }

      const payments = await Payment.findAll({
        where,
        include: [
          { model: User, where: userWhere, attributes: ['id', 'name', 'email'] },
          { model: Contract, attributes: ['id', 'title'] }
        ],
        order: [['dueDate', 'DESC']]
      });
      return res.json(payments);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar todos os pagamentos' });
    }
  }

  async updatePayment(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem editar faturas' });
    }
    try {
      const { id } = req.params;
      const { amount, dueDate, description, status } = req.body;
      const payment = await Payment.findByPk(id);
      
      if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado' });

      await payment.update({ amount, dueDate, description, status });
      return res.json(payment);
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao atualizar pagamento' });
    }
  }

  async deletePayment(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem excluir faturas' });
    }
    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(id);
      
      if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado' });

      await payment.destroy();
      return res.send();
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao excluir pagamento' });
    }
  }

  async getOverallStats(req, res) {
    try {
      const { startDate, endDate, status } = req.query;
      const { Op } = require('sequelize');
      const where = {};
      const payWhere = {};

      if (status) {
        where.status = status;
        payWhere.status = status;
      }
      
      if (startDate && endDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);
        where.startDate = { [Op.between]: [start, end] };
        payWhere.dueDate = { [Op.between]: [start, end] };
      }

      const userWhere = { role: 'client' };
      if (req.userRole === 'partner') {
        userWhere.partner_id = req.userId;
      }

      // Filter by joining User
      const contracts = await Contract.findAll({ 
        where: { ...where, status: 'active' },
        include: [{ model: User, where: userWhere, attributes: [] }]
      });
      const totalActiveValue = contracts.reduce((acc, c) => acc + Number(c.value || 0), 0);

      const pendingP = await Payment.findAll({ 
        where: { ...payWhere, status: 'pending' },
        include: [{ model: User, where: userWhere, attributes: [] }]
      });
      const pendingAmount = pendingP.reduce((acc, p) => acc + Number(p.amount || 0), 0);
      
      const paidQuery = { status: 'paid' };
      if (startDate && endDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);
        paidQuery.paidAt = { [Op.between]: [start, end] };
      } else {
        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
        paidQuery.paidAt = { [Op.gte]: startOfMonth };
      }

      const paidP = await Payment.findAll({ 
        where: paidQuery,
        include: [{ model: User, where: userWhere, attributes: [] }]
      });
      const paidMonth = paidP.reduce((acc, p) => acc + Number(p.amount || 0), 0);

      return res.json({
        totalActiveValue,
        pendingAmount,
        paidMonth
      });
    } catch (err) {
      console.error('Stats Error:', err);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

module.exports = new BillingController();

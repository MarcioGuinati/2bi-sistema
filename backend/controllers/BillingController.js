const { Contract, Payment, User } = require('../models');

class BillingController {
  async listContracts(req, res) {
    try {
      const { userId } = req.params;
      const contracts = await Contract.findAll({
        where: { user_id: userId },
        include: [{ model: Payment, order: [['dueDate', 'DESC']] }],
        order: [['createdAt', 'DESC']]
      });
      return res.json(contracts);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar contratos' });
    }
  }

  async storeContract(req, res) {
    try {
      const { user_id, title, value, billingCycle, startDate } = req.body;
      
      const contract = await Contract.create({
        user_id,
        title,
        value,
        billingCycle,
        startDate: startDate || new Date(),
        status: 'active'
      });

      // Automatically generate the first payment
      await Payment.create({
        user_id,
        contract_id: contract.id,
        amount: value,
        dueDate: startDate || new Date(),
        status: 'pending',
        description: `Parcela 1 - ${title}`
      });

      return res.json(contract);
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao criar contrato' });
    }
  }

  async updateContract(req, res) {
    try {
      const { id } = req.params;
      const { title, value, billingCycle, startDate } = req.body;
      const contract = await Contract.findByPk(id);
      
      if (!contract) return res.status(404).json({ error: 'Contrato não encontrado' });

      await contract.update({ title, value, billingCycle, startDate });
      return res.json(contract);
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao atualizar contrato' });
    }
  }

  async deleteContract(req, res) {
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

  // Get all payments for a specific user (Billing History)
  async listPayments(req, res) {
    try {
      const { userId } = req.params;
      const payments = await Payment.findAll({
        where: { user_id: userId },
        include: [{ model: Contract }],
        order: [['dueDate', 'DESC']]
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

      const payments = await Payment.findAll({
        where,
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
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
        where.startDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        payWhere.dueDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      const totalContracts = await Contract.sum('value', { where: { ...where, status: 'active' } });
      const pendingPayments = await Payment.sum('amount', { where: { ...payWhere, status: 'pending' } });
      
      const paidQuery = { 
        status: 'paid',
        paidAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      };

      // If filtering by date, we might want "paid in this period" instead of "paid this month"
      if (startDate && endDate) {
        paidQuery.paidAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      const paidInPeriod = await Payment.sum('amount', { where: paidQuery });

      return res.json({
        totalActiveValue: totalContracts || 0,
        pendingAmount: pendingPayments || 0,
        paidMonth: paidInPeriod || 0
      });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

module.exports = new BillingController();

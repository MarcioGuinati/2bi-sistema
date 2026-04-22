const { Contract, Payment, User } = require('../models');

class BillingController {
  async listContracts(req, res) {
    try {
      const { userId } = req.params;

      if (req.userRole !== 'admin' && String(req.userId) !== String(userId)) {
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
      const { user_id, title, setupValue = 0, monthlyValue = 0, billingCycle, startDate, recurrence = 1 } = req.body;
      
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
        status: 'active'
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

  async markPaymentAsPending(req, res) {
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

      if (req.userRole !== 'admin' && String(req.userId) !== String(userId)) {
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
        // Force UTC by appending time and Z suffix to date strings
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);

        where.startDate = { [Op.between]: [start, end] };
        payWhere.dueDate = { [Op.between]: [start, end] };
      }

      // 1. Total Contracts Value
      const contracts = await Contract.findAll({ where: { ...where, status: 'active' } });
      const totalActiveValue = contracts.reduce((acc, c) => acc + Number(c.value || 0), 0);

      // 2. Pending Amount
      const pendingP = await Payment.findAll({ where: { ...payWhere, status: 'pending' } });
      const pendingAmount = pendingP.reduce((acc, p) => acc + Number(p.amount || 0), 0);
      
      // 3. Paid Month / Period
      const paidQuery = { status: 'paid' };
      
      if (startDate && endDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);
        paidQuery.paidAt = { [Op.between]: [start, end] };
      } else {
        // Default: Start of current month in UTC to avoid local timezone issues
        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
        paidQuery.paidAt = { [Op.gte]: startOfMonth };
      }

      const paidP = await Payment.findAll({ where: paidQuery });
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

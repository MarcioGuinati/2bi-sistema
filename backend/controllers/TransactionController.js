const { Transaction, Category, User, Account, sequelize } = require('../models');
const { Op } = require('sequelize');

class TransactionController {
  async index(req, res) {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      category_id, 
      account_id, 
      startDate, 
      endDate, 
      description,
      minAmount,
      maxAmount
    } = req.query;

    const offset = (page - 1) * limit;

    const where = { user_id: req.userId };

    if (type) where.type = type;
    if (category_id) where.category_id = category_id;
    if (account_id) where.account_id = account_id;
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: [startDate] };
    } else if (endDate) {
      where.date = { [Op.lte]: [endDate] };
    }

    if (description) {
      where.description = { [Op.iLike]: `%${description}%` };
    }

    if (minAmount && maxAmount) {
      where.amount = { [Op.between]: [minAmount, maxAmount] };
    } else if (minAmount) {
      where.amount = { [Op.gte]: minAmount };
    } else if (maxAmount) {
      where.amount = { [Op.lte]: maxAmount };
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: Category, attributes: ['name', 'type'] },
        { model: Account, attributes: ['name'] }
      ],
      order: [['date', 'DESC'], ['created_at', 'DESC']]
    });

    return res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: Number(page),
      rows
    });
  }

  async store(req, res) {
    const { amount, description, type, category_id, account_id, date } = req.body;

    const transaction = await Transaction.create({
      amount,
      description,
      type,
      category_id,
      account_id,
      user_id: req.userId,
      date
    });

    return res.json(transaction);
  }

  async update(req, res) {
    const { id } = req.params;
    const { amount, description, type, category_id, account_id, date } = req.body;

    const transaction = await Transaction.findByPk(id);

    if (!transaction || transaction.user_id !== req.userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.update({ amount, description, type, category_id, account_id, date });

    return res.json(transaction);
  }

  async delete(req, res) {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);

    if (!transaction || transaction.user_id !== req.userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.destroy();

    return res.send();
  }

  async stats(req, res) {
    const transactions = await Transaction.findAll({
      where: { user_id: req.userId }
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return res.json({
      income,
      expense,
      balance: income - expense
    });
  }

  async dashboardStats(req, res) {
    const userId = req.userId;
    const currentYear = new Date().getFullYear();

    try {
      // 1. Monthly Stats for the current year
      const monthlyData = [];
      const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      for (let i = 0; i < 12; i++) {
        const startDate = new Date(currentYear, i, 1);
        const endDate = new Date(currentYear, i + 1, 0);

        const monthTransactions = await Transaction.findAll({
          where: {
            user_id: userId,
            date: {
              [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
            }
          }
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        const expense = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        monthlyData.push({
          month: months[i],
          receita: income,
          despesa: expense,
          saldo: income - expense
        });
      }

      // 2. Category Breakdown (Expenses only)
      const categoryData = await Transaction.findAll({
        where: {
          user_id: userId,
          type: 'expense'
        },
        include: [{
          model: Category,
          attributes: ['name']
        }]
      });

      const categoryTotals = {};
      categoryData.forEach(t => {
        const catName = t.Category?.name || 'Outros';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(t.amount || 0);
      });

      const categories = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value
      })).sort((a, b) => b.value - a.value);

      return res.json({
        monthlyData,
        categoryData: categories
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new TransactionController();

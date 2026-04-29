const { Transaction, Category, User, Account, sequelize } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('../services/AuditService');

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
    const targetUserId = (req.userRole === 'admin' || req.userRole === 'partner') && req.query.userId 
      ? req.query.userId 
      : req.userId;

    const where = { user_id: targetUserId };

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
    const { 
      amount,
      description,
      type,
      category_id,
      account_id,
      date,
      recurrenceType,
      installmentsCount,
      repeatUntil,
      is_paid,
      userId
    } = req.body;

    const targetUserId = (req.userRole === 'admin' || req.userRole === 'partner') && userId 
      ? userId 
      : req.userId;

    const t = await sequelize.transaction();

    try {
      let transactions = [];

      if (recurrenceType === 'installments' && installmentsCount > 1) {
        const totalAmount = parseFloat(amount);
        const installmentAmount = Math.floor((totalAmount / installmentsCount) * 100) / 100;
        const remainder = parseFloat((totalAmount - (installmentAmount * installmentsCount)).toFixed(2));

        for (let i = 0; i < installmentsCount; i++) {
          const currentAmount = i === installmentsCount - 1 
            ? (installmentAmount + remainder).toFixed(2) 
            : installmentAmount.toFixed(2);

          const currentMonth = new Date(date + 'T00:00:00');
          currentMonth.setMonth(currentMonth.getMonth() + i);

          transactions.push({
            amount: currentAmount,
            description: `${description} (Parcela ${i + 1}/${installmentsCount})`,
            type,
            category_id,
            account_id,
            user_id: req.userId,
            date: currentMonth.toISOString().split('T')[0],
            is_paid: i === 0 ? is_paid : false
          });
        }
      } else if (recurrenceType === 'fixed' && repeatUntil) {
        const startDate = new Date(date + 'T00:00:00');
        const endDate = new Date(repeatUntil + 'T00:00:00');
        
        let currentMonth = new Date(startDate);
        while (currentMonth <= endDate) {
          transactions.push({
            amount,
            description,
            type,
            category_id,
            account_id,
            user_id: targetUserId,
            date: currentMonth.toISOString().split('T')[0],
            is_paid: transactions.length === 0 ? is_paid : false
          });
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
      } else {
        transactions.push({
          amount,
          description,
          type,
          category_id,
          account_id,
          user_id: req.userId,
          date,
          is_paid
        });
      }

      if (transactions.length === 0) {
        throw new Error('Nenhuma transação gerada');
      }

      const createdTransactions = await Transaction.bulkCreate(transactions, { transaction: t });
      await t.commit();

      // Log the action (if bulk, we log the first one's detail or a summary)
      await AuditService.log(
        req.userId, 
        createdTransactions.length > 1 ? 'TRANSACTION_BULK_CREATE' : 'TRANSACTION_CREATE', 
        'Finance', 
        { count: createdTransactions.length, firstDescription: createdTransactions[0].description, targetUserId },
        req.ip
      );

      return res.json(createdTransactions[0]);
    } catch (error) {
      await t.rollback();
      console.error('Error creating transactions:', error);
      return res.status(500).json({ error: 'Erro ao criar transações' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const { amount, description, type, category_id, account_id, date, is_paid } = req.body;

    const transaction = await Transaction.findByPk(id);

    if (!transaction || transaction.user_id !== req.userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.update({ amount, description, type, category_id, account_id, date, is_paid });

    await AuditService.log(
      req.userId, 
      'TRANSACTION_UPDATE', 
      'Finance', 
      { id, description: transaction.description },
      req.ip
    );

    return res.json(transaction);
  }

  async delete(req, res) {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);

    if (!transaction || transaction.user_id !== req.userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.destroy();

    await AuditService.log(
      req.userId, 
      'TRANSACTION_DELETE', 
      'Finance', 
      { id, description: transaction.description },
      req.ip
    );

    return res.send();
  }

  async stats(req, res) {
    const { 
      startDate, 
      endDate, 
      category_id, 
      account_id, 
      description,
      type
    } = req.query;
    
    // Allow admin/partner to view stats for a specific user
    const targetUserId = (req.userRole === 'admin' || req.userRole === 'partner') && req.query.userId 
      ? req.query.userId 
      : req.userId;

    const where = { user_id: targetUserId };

    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (!startDate && !endDate) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      where.date = { [Op.between]: [firstDay, lastDay] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    // Apply additional filters
    if (category_id) where.category_id = category_id;
    if (account_id) where.account_id = account_id;
    if (type) where.type = type;
    if (description) {
      where.description = { [Op.iLike]: `%${description}%` };
    }

    const transactions = await Transaction.findAll({ where });

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
    const targetUserId = (req.userRole === 'admin' || req.userRole === 'partner') && req.query.userId 
      ? req.query.userId 
      : req.userId;
    const currentYear = new Date().getFullYear();

    try {
      // 1. Monthly Stats for the current year
      const monthlyData = [];
      const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      let runningBalance = 0;
      let currentMonthIncome = 0;
      let prevMonthIncome = 0;
      let currentMonthExpense = 0;
      let prevMonthExpense = 0;

      const now = new Date();
      const currentMonthIndex = now.getMonth();

      for (let i = 0; i < 12; i++) {
        const startDate = new Date(currentYear, i, 1);
        const endDate = new Date(currentYear, i + 1, 0);

        const monthTransactions = await Transaction.findAll({
          where: {
            user_id: targetUserId,
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

        runningBalance += (income - expense);

        monthlyData.push({
          month: months[i],
          receita: income,
          despesa: expense,
          saldo: income - expense,
          saldoAcumulado: runningBalance
        });

        if (i === currentMonthIndex) {
          currentMonthIncome = income;
          currentMonthExpense = expense;
        } else if (i === currentMonthIndex - 1) {
          prevMonthIncome = income;
          prevMonthExpense = expense;
        }
      }

      // 2. Category Breakdown (Expenses only)
      const { startDate, endDate } = req.query;
      const categoryWhere = {
        user_id: targetUserId,
        type: 'expense'
      };

      if (startDate && endDate) {
        categoryWhere.date = { [Op.between]: [startDate, endDate] };
      }

      const allDetailedTransactions = await Transaction.findAll({
        where: categoryWhere,
        include: [{
          model: Category,
          attributes: ['name']
        }],
        order: [['date', 'ASC']]
      });

      // Category Totals
      const categoryTotals = {};
      const dailyTotals = {};
      
      allDetailedTransactions.forEach(t => {
        // Categories
        const catName = t.Category?.name || 'Outros';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(t.amount || 0);

        // Daily
        const day = t.date;
        dailyTotals[day] = (dailyTotals[day] || 0) + parseFloat(t.amount || 0);
      });

      const categories = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value
      })).sort((a, b) => b.value - a.value);

      const dailyData = Object.entries(dailyTotals).map(([date, value]) => ({
        date,
        total: value
      }));

      // Top 5 Expenses
      const topExpenses = allDetailedTransactions
        .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
        .slice(0, 5)
        .map(t => ({
          description: t.description,
          amount: t.amount,
          date: t.date,
          category: t.Category?.name || 'Outros'
        }));

      return res.json({
        monthlyData,
        categoryData: categories,
        dailyData,
        topExpenses,
        comparison: {
          income: {
            current: currentMonthIncome,
            previous: prevMonthIncome,
            diff: currentMonthIncome - prevMonthIncome,
            percent: prevMonthIncome > 0 ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100 : 0
          },
          expense: {
            current: currentMonthExpense,
            previous: prevMonthExpense,
            diff: currentMonthExpense - prevMonthExpense,
            percent: prevMonthExpense > 0 ? ((currentMonthExpense - prevMonthExpense) / prevMonthExpense) * 100 : 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async bulkDelete(req, res) {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs must be a non-empty array' });
    }

    try {
      await Transaction.destroy({
        where: {
          id: ids,
          user_id: req.userId
        }
      });

      await AuditService.log(
        req.userId, 
        'TRANSACTION_BULK_DELETE', 
        'Finance', 
        { count: ids.length, ids },
        req.ip
      );

      return res.status(204).send();
    } catch (error) {
      console.error('Error in bulk delete:', error);
      return res.status(500).json({ error: 'Erro ao excluir transações em lote' });
    }
  }

  async bulkUpdate(req, res) {
    const { ids, date } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs must be a non-empty array' });
    }

    try {
      await Transaction.update(
        { date },
        {
          where: {
            id: ids,
            user_id: req.userId
          }
        }
      );

      await AuditService.log(
        req.userId, 
        'TRANSACTION_BULK_UPDATE', 
        'Finance', 
        { count: ids.length, date, ids },
        req.ip
      );

      return res.status(200).json({ message: 'Transações atualizadas com sucesso' });
    } catch (error) {
      console.error('Error in bulk update:', error);
      return res.status(500).json({ error: 'Erro ao atualizar transações em lote' });
    }
  }
}

module.exports = new TransactionController();

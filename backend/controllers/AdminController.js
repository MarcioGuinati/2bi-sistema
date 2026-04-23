const { User, Transaction, Goal, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

class AdminController {
  async getMentorshipOverview(req, res) {
    try {
      const { month, year } = req.query;
      const now = new Date();
      
      const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
      const targetYear = year ? parseInt(year) : now.getFullYear();

      // Start and End dates for the selected month
      const startDate = new Date(targetYear, targetMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(targetYear, targetMonth + 1, 0).toISOString().split('T')[0];

      // 1. Get all clients
      const clients = await User.findAll({
        where: { role: 'client' },
        attributes: ['id', 'name', 'email', 'phone', 'createdAt'],
        order: [['name', 'ASC']]
      });

      const overview = await Promise.all(clients.map(async (client) => {
        // Calculate totals for current month
        const stats = await Transaction.findAll({
          where: {
            user_id: client.id,
            date: { [Op.between]: [startDate, endDate] }
          },
          attributes: [
            'type',
            [sequelize.fn('sum', sequelize.col('amount')), 'total']
          ],
          group: ['type']
        });

        const income = parseFloat(stats.find(s => s.type === 'income')?.get('total') || 0);
        const expense = parseFloat(stats.find(s => s.type === 'expense')?.get('total') || 0);

        // Check Budgets (Goals with category_id)
        const goals = await Goal.findAll({
          where: { user_id: client.id, category_id: { [Op.ne]: null } }
        });

        let overBudgetCount = 0;
        for (const goal of goals) {
          const spent = await Transaction.sum('amount', {
            where: {
              user_id: client.id,
              category_id: goal.category_id,
              date: { [Op.between]: [startDate, endDate] }
            }
          }) || 0;

          if (spent > parseFloat(goal.targetAmount)) {
            overBudgetCount++;
          }
        }

        // Get last transaction
        const lastTx = await Transaction.findOne({
          where: { user_id: client.id },
          order: [['date', 'DESC'], ['createdAt', 'DESC']],
          attributes: ['date']
        });

        return {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          incomeMonth: income,
          expenseMonth: expense,
          balanceMonth: income - expense,
          overBudgetCount,
          isNegative: (income - expense) < 0,
          lastActive: lastTx ? lastTx.date : client.createdAt
        };
      }));

      return res.json(overview);
    } catch (error) {
      console.error('Error in Mentorship Overview:', error);
      return res.status(500).json({ error: 'Erro ao carregar visão consolidada' });
    }
  }
}

module.exports = new AdminController();

const { Goal, Transaction, Category } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('../services/AuditService');

class GoalController {
  async index(req, res) {
    const goals = await Goal.findAll({
      where: { user_id: req.userId },
      include: [{ model: Category, attributes: ['name', 'type'] }],
      order: [['deadline', 'ASC']]
    });

    // Calculate dynamic currentAmount for category-based goals (monthly budget)
    const startDate = new Date();
    startDate.setDate(1); // First day of current month
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(); // Today

    const goalsWithDynamicProgress = await Promise.all(goals.map(async (goal) => {
      const g = goal.toJSON();
      
      if (g.category_id) {
        // Calculate sum of transactions for this category in the current month
        const totalSpent = await Transaction.sum('amount', {
          where: {
            user_id: req.userId,
            category_id: g.category_id,
            date: {
              [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
            }
          }
        });

        g.currentAmount = totalSpent || 0;
      }

      return g;
    }));

    return res.json(goalsWithDynamicProgress);
  }

  async store(req, res) {
    const { title, targetAmount, currentAmount, deadline, category_id } = req.body;

    const goal = await Goal.create({
      title,
      targetAmount,
      currentAmount: category_id ? 0 : currentAmount, // If category-based, we start with 0 and calculate dynamically
      deadline,
      category_id: category_id || null,
      user_id: req.userId
    });

    await AuditService.log(req.userId, 'GOAL_CREATE', 'Finance', { id: goal.id, title, targetAmount }, req.ip);

    return res.json(goal);
  }

  async update(req, res) {
    const { id } = req.params;
    const { title, targetAmount, currentAmount, deadline, category_id } = req.body;

    const goal = await Goal.findByPk(id);

    if (!goal || goal.user_id !== req.userId) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await goal.update({ 
      title, 
      targetAmount, 
      currentAmount: category_id ? 0 : currentAmount,
      deadline, 
      category_id: category_id || null 
    });

    await AuditService.log(req.userId, 'GOAL_UPDATE', 'Finance', { id, title }, req.ip);

    return res.json(goal);
  }

  async delete(req, res) {
    const { id } = req.params;

    const goal = await Goal.findByPk(id);

    if (!goal || goal.user_id !== req.userId) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await goal.destroy();

    await AuditService.log(req.userId, 'GOAL_DELETE', 'Finance', { id, title: goal.title }, req.ip);

    return res.send();
  }
}

module.exports = new GoalController();

const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

class AuditController {
  async index(req, res) {
    try {
      const { page = 1, limit = 20, action, userId, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (action) where.action = { [Op.iLike]: `%${action}%` };
      if (userId) where.userId = userId;
      
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [startDate, endDate] };
      } else if (startDate) {
        where.createdAt = { [Op.gte]: startDate };
      } else if (endDate) {
        where.createdAt = { [Op.lte]: endDate };
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'name', 'email', 'role'] 
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.json({
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        rows
      });
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      return res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
    }
  }
}

module.exports = new AuditController();

const { Report, User } = require('../models');

class ReportController {
  async index(req, res) {
    try {
      const { userId } = req.query; // Admin can filter by user
      const where = {};
      
      if (req.userRole === 'admin' || req.userRole === 'partner') {
        if (userId) where.user_id = userId;
      } else {
        // Client can only see their own
        where.user_id = req.userId;
      }

      const reports = await Report.findAll({
        where,
        include: [
          { model: User, as: 'client', attributes: ['name', 'email'] },
          { model: User, as: 'consultant', attributes: ['name'] }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.json(reports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      return res.status(500).json({ error: 'Erro ao buscar relatórios' });
    }
  }

  async store(req, res) {
    try {
      const { user_id, title, period_start, period_end, summary_data, consultant_note } = req.body;

      if (req.userRole === 'client') {
        return res.status(403).json({ error: 'Apenas administradores podem publicar relatórios' });
      }

      const report = await Report.create({
        user_id,
        title,
        period_start,
        period_end,
        summary_data,
        consultant_note,
        published_by: req.userId
      });

      return res.json(report);
    } catch (err) {
      console.error('Error creating report:', err);
      return res.status(500).json({ error: 'Erro ao publicar relatório' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const report = await Report.findByPk(id);

      if (!report) {
        return res.status(404).json({ error: 'Relatório não encontrado' });
      }

      if (req.userRole === 'client') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await report.destroy();

      return res.send();
    } catch (err) {
      console.error('Error deleting report:', err);
      return res.status(500).json({ error: 'Erro ao excluir relatório' });
    }
  }
}

module.exports = new ReportController();

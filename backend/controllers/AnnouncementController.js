const { Announcement } = require('../models');

class AnnouncementController {
  async index(req, res) {
    try {
      const { activeOnly } = req.query;
      const where = {};
      
      if (activeOnly === 'true') {
        where.active = true;
      }

      const announcements = await Announcement.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });

      return res.json(announcements);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar avisos' });
    }
  }

  async store(req, res) {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const announcement = await Announcement.create(req.body);
      return res.json(announcement);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao criar aviso' });
    }
  }

  async update(req, res) {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const announcement = await Announcement.findByPk(id);

      if (!announcement) {
        return res.status(404).json({ error: 'Aviso não encontrado' });
      }

      await announcement.update(req.body);
      return res.json(announcement);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao atualizar aviso' });
    }
  }

  async delete(req, res) {
    try {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const announcement = await Announcement.findByPk(id);

      if (!announcement) {
        return res.status(404).json({ error: 'Aviso não encontrado' });
      }

      await announcement.destroy();
      return res.json({ message: 'Aviso excluído com sucesso' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao excluir aviso' });
    }
  }
}

module.exports = new AnnouncementController();

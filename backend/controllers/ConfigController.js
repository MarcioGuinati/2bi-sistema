const { Setting, Insight, User, sequelize } = require('../models');
const { Op } = require('sequelize');

class ConfigController {
  async getAIConfig(req, res) {
    try {
      const settings = await Setting.findAll({
        where: {
          key: ['openai_key', 'openai_model', 'ai_system_prompt']
        }
      });

      const config = {};
      settings.forEach(s => {
        config[s.key] = s.value;
      });

      return res.json(config);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  }

  async updateAIConfig(req, res) {
    try {
      const { openai_key, openai_model, ai_system_prompt } = req.body;

      const items = [
        { key: 'openai_key', value: openai_key },
        { key: 'openai_model', value: openai_model },
        { key: 'ai_system_prompt', value: ai_system_prompt }
      ];

      for (const item of items) {
        await Setting.upsert(item);
      }

      return res.json({ message: 'Configurações atualizadas com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
  }

  async getAIUsage(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const whereInsight = {};
      if (startDate && endDate) {
        whereInsight.created_at = { [Op.between]: [startDate, endDate] };
      }

      // Invertemos a lógica: buscamos usuários que possuem insights para garantir os dados do usuário
      const usage = await User.findAll({
        attributes: [
          ['id', 'user_id'],
          'name',
          'email',
          [sequelize.fn('COUNT', sequelize.col('Insights.id')), 'total_insights'],
          [sequelize.fn('MAX', sequelize.col('Insights.created_at')), 'last_use']
        ],
        include: [{
          model: Insight,
          attributes: [],
          required: true, // Somente usuários que tem insights
          where: whereInsight
        }],
        group: ['User.id'],
        order: [[sequelize.fn('MAX', sequelize.col('Insights.created_at')), 'DESC']],
        raw: true
      });

      return res.json(usage);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar relatório de uso' });
    }
  }

  async getDetailedAIUsage(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const where = {};
      if (startDate && endDate) {
        where.created_at = { [Op.between]: [startDate, endDate] };
      }

      const usage = await Insight.findAll({
        where,
        include: [{
          model: User,
          attributes: ['name', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });

      return res.json(usage);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar detalhamento de uso' });
    }
  }
}

module.exports = new ConfigController();

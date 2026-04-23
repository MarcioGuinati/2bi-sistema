const { Setting } = require('../models');

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
}

module.exports = new ConfigController();

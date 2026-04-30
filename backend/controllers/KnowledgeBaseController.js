const { KnowledgeBase } = require('../models');

exports.index = async (req, res) => {
  try {
    const items = await KnowledgeBase.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar base de conhecimento' });
  }
};

exports.store = async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem criar conteúdo' });
  }
  try {
    const item = await KnowledgeBase.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar item na base de conhecimento' });
  }
};

exports.update = async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem editar conteúdo' });
  }
  try {
    const { id } = req.params;
    const item = await KnowledgeBase.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });
    
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar item' });
  }
};

exports.delete = async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem excluir conteúdo' });
  }
  try {
    const { id } = req.params;
    const item = await KnowledgeBase.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });
    
    await item.destroy();
    res.json({ message: 'Item excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir item' });
  }
};

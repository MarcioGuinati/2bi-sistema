const { Category } = require('../models');
const AuditService = require('../services/AuditService');

class CategoryController {
  async index(req, res) {
    const categories = await Category.findAll({
      where: { user_id: req.userId },
      order: [['name', 'ASC']]
    });

    return res.json(categories);
  }

  async store(req, res) {
    const { name, type } = req.body;

    const category = await Category.create({
      name,
      type,
      user_id: req.userId
    });

    await AuditService.log(req.userId, 'CATEGORY_CREATE', 'Finance', { id: category.id, name, type }, req.ip);

    return res.json(category);
  }

  async update(req, res) {
    const { id } = req.params;
    const { name, type } = req.body;

    const category = await Category.findByPk(id);

    if (!category || category.user_id !== req.userId) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.update({ name, type });

    await AuditService.log(req.userId, 'CATEGORY_UPDATE', 'Finance', { id, name, type }, req.ip);

    return res.json(category);
  }

  async delete(req, res) {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category || category.user_id !== req.userId) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.destroy();

    await AuditService.log(req.userId, 'CATEGORY_DELETE', 'Finance', { id, name: category.name }, req.ip);

    return res.send();
  }
}

module.exports = new CategoryController();

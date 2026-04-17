const { Category } = require('../models');

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

    return res.json(category);
  }

  async delete(req, res) {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category || category.user_id !== req.userId) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.destroy();

    return res.send();
  }
}

module.exports = new CategoryController();

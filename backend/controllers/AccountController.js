const { Account } = require('../models');

class AccountController {
  async index(req, res) {
    const accounts = await Account.findAll({
      where: { user_id: req.userId },
      order: [['name', 'ASC']]
    });

    return res.json(accounts);
  }

  async store(req, res) {
    const { name, type, initial_balance } = req.body;

    const account = await Account.create({
      name,
      type,
      initial_balance,
      user_id: req.userId
    });

    return res.json(account);
  }

  async update(req, res) {
    const { id } = req.params;
    const { name, type, initial_balance } = req.body;

    const account = await Account.findByPk(id);

    if (!account || account.user_id !== req.userId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await account.update({ name, type, initial_balance });

    return res.json(account);
  }

  async delete(req, res) {
    const { id } = req.params;

    const account = await Account.findByPk(id);

    if (!account || account.user_id !== req.userId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await account.destroy();

    return res.send();
  }
}

module.exports = new AccountController();

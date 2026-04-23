const { Account } = require('../models');

class AccountController {
  async index(req, res) {
    const { Transaction } = require('../models');
    const accounts = await Account.findAll({
      where: { user_id: req.userId },
      include: [{ model: Transaction }],
      order: [['name', 'ASC']]
    });

    const accountsWithBalance = accounts.map(acc => {
      const transactions = acc.Transactions || [];
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const json = acc.toJSON();
      json.current_balance = Number(acc.initial_balance) + totalIncome - totalExpense;
      json.used_limit = totalExpense - totalIncome; // Typically used for credit cards
      if (json.used_limit < 0) json.used_limit = 0;
      
      return json;
    });

    return res.json(accountsWithBalance);
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

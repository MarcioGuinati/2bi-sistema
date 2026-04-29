const { Account } = require('../models');
const AuditService = require('../services/AuditService');

class AccountController {
  async index(req, res) {
    const targetUserId = (req.userRole === 'admin' || req.userRole === 'partner') && req.query.userId 
      ? req.query.userId 
      : req.userId;

    const { Transaction } = require('../models');
    const accounts = await Account.findAll({
      where: { user_id: targetUserId },
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
    const { name, type, initial_balance, credit_limit, invoice_closing_day, due_day, color, userId } = req.body;

    const targetUserId = (req.userRole === 'admin' || req.userRole === 'partner') && userId 
      ? userId 
      : req.userId;

    const account = await Account.create({
      name,
      type,
      initial_balance,
      credit_limit,
      invoice_closing_day,
      due_day,
      color,
      user_id: targetUserId
    });

    await AuditService.log(req.userId, 'ACCOUNT_CREATE', 'Finance', { id: account.id, name, type, targetUserId }, req.ip);

    return res.json(account);
  }

  async update(req, res) {
    const { id } = req.params;
    const { name, type, initial_balance, credit_limit, invoice_closing_day, due_day, color } = req.body;

    const account = await Account.findByPk(id);

    if (!account || account.user_id !== req.userId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await account.update({ name, type, initial_balance, credit_limit, invoice_closing_day, due_day, color });

    await AuditService.log(req.userId, 'ACCOUNT_UPDATE', 'Finance', { id, name }, req.ip);

    return res.json(account);
  }

  async delete(req, res) {
    const { id } = req.params;

    const account = await Account.findByPk(id);

    if (!account || account.user_id !== req.userId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await account.destroy();

    await AuditService.log(req.userId, 'ACCOUNT_DELETE', 'Finance', { id, name: account.name }, req.ip);

    return res.send();
  }
}

module.exports = new AccountController();

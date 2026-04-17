const { Contract } = require('../models');

class ContractController {
  async index(req, res) {
    const { userId } = req.params;

    const contracts = await Contract.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    return res.json(contracts);
  }

  async store(req, res) {
    const { userId } = req.params;
    const { title, url } = req.body;

    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const contract = await Contract.create({
      title,
      url,
      user_id: userId
    });

    return res.json(contract);
  }

  async update(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const contract = await Contract.findByPk(id);
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    await contract.update({ status });

    return res.json(contract);
  }
}

module.exports = new ContractController();

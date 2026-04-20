const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, role } = user;

    return res.json({
      user: { id, name, email, role },
      token: jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      }),
    });
  }

  async registerClient(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register clients' });
    }

    const { name, email, password, phone, cpf, income, occupation, financialGoal, customFields } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 8);

    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: 'client',
      phone,
      cpf,
      income,
      occupation,
      financialGoal,
      customFields: customFields || []
    });

    return res.json(user);
  }

  async listClients(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can list clients' });
    }

    const clients = await User.findAll({
      where: { role: 'client' },
      attributes: ['id', 'name', 'email', 'phone', 'cpf', 'income', 'occupation', 'financialGoal', 'customFields', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    return res.json(clients);
  }

  async updateClient(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update clients' });
    }

    const { id } = req.params;
    const { name, email, password, phone, cpf, income, occupation, financialGoal, customFields } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = { name, email, phone, cpf, income, occupation, financialGoal, customFields };

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 8);
    }

    // Use set and save for more robust JSONB updates
    user.set(updateData);
    if (customFields) {
      user.changed('customFields', true);
    }
    await user.save();

    return res.json(user);
  }

  async deleteClient(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete clients' });
    }

    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    return res.send();
  }
}

module.exports = new AuthController();

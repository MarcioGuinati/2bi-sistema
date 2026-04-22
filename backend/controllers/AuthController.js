const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

class AuthController {
  async login(req, res) {
    try {
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
    } catch (err) {
      console.error('Error in login:', err);
      return res.status(500).json({ 
        error: 'Error in login', 
        details: err.message 
      });
    }
  }

  async registerClient(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register clients' });
    }

    const { name, email, password, phone, cpf, income, occupation, financialGoal, customFields, onboardingData } = req.body;

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
      customFields: customFields || [],
      onboardingData: onboardingData || {}
    });

    return res.json(user);
  }
 
  async registerLead(req, res) {
    try {
      const { name, email, phone, objective, message } = req.body;
 
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
      }
 
      // Generate a random placeholder password
      const randomPass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const passwordHash = await bcrypt.hash(randomPass, 8);
 
      const user = await User.create({
        name,
        email,
        password: passwordHash,
        role: 'client',
        phone,
        isLead: true,
        isActive: false,
        leadSource: 'site',
        financialGoal: `Objetivo: ${objective}. Mensagem: ${message}`
      });
 
      return res.json({ success: true, message: 'Solicitação enviada com sucesso' });
    } catch (err) {
      console.error('Error registering lead:', err);
      return res.status(500).json({ error: 'Erro ao processar sua solicitaçã' });
    }
  }

  async listClients(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can list clients' });
    }

    const clients = await User.findAll({
      where: { role: 'client' },
      attributes: ['id', 'name', 'email', 'phone', 'cpf', 'income', 'occupation', 'financialGoal', 'customFields', 'onboardingData', 'isLead', 'isActive', 'leadSource', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    return res.json(clients);
  }

  async updateClient(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update clients' });
    }

    try {
      const { id } = req.params;
      const { name, email, password, phone, cpf, income, occupation, financialGoal, customFields, onboardingData } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Only update fields provided in the request body
      const fields = { name, email, phone, cpf, income, occupation, financialGoal, customFields, onboardingData };
      const updateData = {};
      
      Object.keys(fields).forEach(key => {
        if (fields[key] !== undefined) {
          updateData[key] = fields[key];
        }
      });

      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 8);
        // Se era um lead inativo, ao cadastrar a senha ele vira um cliente ativo
        updateData.isActive = true;
      }

      user.set(updateData);
      
      if (customFields) {
        user.changed('customFields', true);
      }
      if (onboardingData) {
        user.changed('onboardingData', true);
      }
      
      await user.save();

      return res.json(user);
    } catch (err) {
      console.error('Error updating client:', err);
      return res.status(500).json({ 
        error: 'Error updating client', 
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
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

  async impersonate(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can impersonate users' });
    }

    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (user.role !== 'client') {
      return res.status(400).json({ error: 'Only clients can be impersonated' });
    }

    const { name, email, role } = user;

    return res.json({
      user: { id: user.id, name, email, role },
      token: jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      }),
    });
  }
}

module.exports = new AuthController();

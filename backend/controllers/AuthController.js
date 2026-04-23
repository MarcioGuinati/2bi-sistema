const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const sequelize = require('../config/database');
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
    if (req.userRole !== 'admin' && req.userRole !== 'partner') {
      return res.status(403).json({ error: 'Only admins or partners can register clients' });
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
      partner_id: req.userRole === 'partner' ? req.userId : null,
      customFields: customFields || [],
      onboardingData: onboardingData || {}
    });

    return res.json(user);
  }

  async registerPartner(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register partners' });
    }

    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 8);

    const partner = await User.create({
      name,
      email,
      password: passwordHash,
      role: 'partner',
      phone
    });

    return res.json(partner);
  }

  async updatePartner(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem gerenciar parceiros' });
    }

    try {
      const { id } = req.params;
      const { name, email, password, phone } = req.body;
      const partner = await User.findByPk(id);

      if (!partner || partner.role !== 'partner') {
        return res.status(404).json({ error: 'Parceiro não encontrado' });
      }

      const updateData = { name, email, phone };
      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 8);
      }

      await partner.update(updateData);
      return res.json(partner);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao atualizar parceiro' });
    }
  }

  async deletePartner(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    try {
      const { id } = req.params;
      // Note: Clients will remain but partner_id set to null or kept? 
      // Usually better to keep them but detached or block delete if has clients.
      // For now, let's just delete the partner.
      const partner = await User.findByPk(id);
      if (!partner || partner.role !== 'partner') {
        return res.status(404).json({ error: 'Parceiro não encontrado' });
      }

      await partner.destroy();
      return res.send();
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao excluir parceiro' });
    }
  }
 
  async registerLead(req, res) {
    try {
      const { name, email, phone, objective, message } = req.body;
 
      // Basic Server-Side Validation
      if (!name || name.length < 3) {
        return res.status(400).json({ error: 'Nome muito curto ou inválido' });
      }
 
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato de e-mail inválido' });
      }
 
      if (!phone || phone.length < 8) {
        return res.status(400).json({ error: 'Telefone inválido' });
      }
 
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'Este e-mail já possui uma solicitação em andamento' });
      }
 
      // Generate a random placeholder password
      const randomPass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const passwordHash = await bcrypt.hash(randomPass, 8);
 
      const user = await User.create({
        name: name.substring(0, 255), // Truncate to prevent overflow
        email: email.toLowerCase().trim(),
        password: passwordHash,
        role: 'client',
        phone: phone.replace(/\D/g, ''), // Clean to keep only digits
        isLead: true,
        isActive: false,
        leadSource: 'site',
        financialGoal: `Objetivo: ${objective}. Mensagem: ${message.substring(0, 1000)}`
      });
 
      return res.json({ success: true, message: 'Solicitação enviada com sucesso' });
    } catch (err) {
      console.error('Error registering lead:', err);
      return res.status(500).json({ error: 'Erro ao processar sua solicitação' });
    }
  }

  async listClients(req, res) {
    if (req.userRole !== 'admin' && req.userRole !== 'partner') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { partnerId } = req.query;
    const where = { role: 'client' };
    
    if (req.userRole === 'partner') {
      where.partner_id = req.userId;
    } else if (partnerId && partnerId !== 'all') {
      where.partner_id = partnerId;
    }

    const clients = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'phone', 'cpf', 'income', 'occupation', 'financialGoal', 'customFields', 'onboardingData', 'isLead', 'isActive', 'leadSource', 'partner_id', 'createdAt'],
      include: [
        { model: User, as: 'Partner', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json(clients);
  }

  async updateClient(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem editar perfiis de clientes' });
    }

    try {
      const { id } = req.params;
      const { name, email, password, phone, cpf, income, occupation, financialGoal, customFields, onboardingData } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If partner, check if client belongs to them
      if (req.userRole === 'partner' && user.partner_id !== req.userId) {
        return res.status(403).json({ error: 'Este cliente não pertence à sua carteira' });
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
        updateData.isActive = true;
      }

      user.set(updateData);
      
      if (customFields) user.changed('customFields', true);
      if (onboardingData) user.changed('onboardingData', true);
      
      await user.save();
      return res.json(user);
    } catch (err) {
      console.error('Error updating client:', err);
      return res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  }

  async deleteClient(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem excluir clientes' });
    }

    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.userRole === 'partner' && user.partner_id !== req.userId) {
      return res.status(403).json({ error: 'Este cliente não pertence à sua carteira' });
    }

    await user.destroy();
    return res.send();
  }

  async impersonate(req, res) {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem utilizar o monitoramento (olhinho)' });
    }

    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (req.userRole === 'partner' && user.partner_id !== req.userId) {
      return res.status(403).json({ error: 'Este cliente não pertence à sua carteira' });
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

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const sequelize = require('../config/database');
const otplib = require('otplib');
const qrcode = require('qrcode');
const AuditService = require('../services/AuditService');
require('dotenv').config();

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        await AuditService.log(null, 'LOGIN_FAILED', 'Auth', { email, reason: 'User not found' }, req.ip);
        return res.status(401).json({ error: 'User not found' });
      }

      if (!(await bcrypt.compare(password, user.password))) {
        await AuditService.log(user.id, 'LOGIN_FAILED', 'Auth', { email, reason: 'Invalid password' }, req.ip);
        return res.status(401).json({ error: 'Password does not match' });
      }

      const { id, name, role, twoFactorEnabled } = user;

      // If 2FA is enabled, return a temporary flag but no final token yet
      if (twoFactorEnabled && role === 'admin') {
        const tempToken = jwt.sign({ id, role, isTemp: true }, process.env.JWT_SECRET, {
          expiresIn: '5m', // Short-lived
        });

        await AuditService.log(user.id, 'LOGIN_2FA_REQUIRED', 'Auth', { email }, req.ip);

        return res.json({
          twoFactorRequired: true,
          tempToken
        });
      }

      await AuditService.log(user.id, 'LOGIN_SUCCESS', 'Auth', { email, role }, req.ip);

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

  async verify2FALogin(req, res) {
    try {
      const { tempToken, code } = req.body;

      if (!tempToken || !code) {
        return res.status(400).json({ error: 'Token temporário e código são obrigatórios' });
      }

      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      
      if (!decoded.isTemp) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const user = await User.findByPk(decoded.id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

      // Use functional verify from otplib v13
      const isValid = await otplib.verify({
        token: code,
        secret: user.twoFactorSecret
      });

      if (!isValid || !isValid.valid) {
        await AuditService.log(user.id, '2FA_VERIFY_FAILED', 'Auth', { email: user.email }, req.ip);
        return res.status(401).json({ error: 'Código de autenticação inválido' });
      }

      const { id, name, email, role } = user;

      await AuditService.log(user.id, '2FA_VERIFY_SUCCESS', 'Auth', { email: user.email, role }, req.ip);

      return res.json({
        user: { id, name, email, role },
        token: jwt.sign({ id, role }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        }),
      });
    } catch (err) {
      console.error('Error in 2FA verification:', err);
      return res.status(401).json({ error: 'Sessão expirada ou inválida' });
    }
  }

  async setup2FA(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Recurso restrito a administradores' });
      }

      // Use functional API from otplib v13
      const secret = otplib.generateSecret();
      const otpauth = otplib.generateURI({
        label: user.email,
        issuer: '2BI Planejamento',
        secret
      });
      
      const qrCodeUrl = await qrcode.toDataURL(otpauth);

      // Save secret temporarily (we'll only set enabled=true after verification)
      await user.update({ twoFactorSecret: secret });

      return res.json({ qrCodeUrl, secret });
    } catch (err) {
      console.error('Error setting up 2FA:', err);
      return res.status(500).json({ error: 'Erro ao configurar 2FA', details: err.message });
    }
  }

  async enable2FA(req, res) {
    try {
      const { code } = req.body;
      const user = await User.findByPk(req.userId);
      
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ error: 'Secret de 2FA não gerado' });
      }

      const isValid = await otplib.verify({
        token: code,
        secret: user.twoFactorSecret
      });

      if (!isValid || !isValid.valid) {
        return res.status(400).json({ error: 'Código de validação incorreto' });
      }

      await user.update({ twoFactorEnabled: true });

      return res.json({ success: true, message: '2FA ativado com sucesso' });
    } catch (err) {
      console.error('Error enabling 2FA:', err);
      return res.status(500).json({ error: 'Erro ao ativar 2FA', details: err.message });
    }
  }

  async disable2FA(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      await user.update({ 
        twoFactorEnabled: false,
        twoFactorSecret: null
      });
      return res.json({ success: true, message: '2FA desativado com sucesso' });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao desativar 2FA' });
    }
  }

  async get2FAStatus(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      return res.json({ enabled: user.twoFactorEnabled });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar status de 2FA' });
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

  async logout(req, res) {
    try {
      await AuditService.log(req.userId, 'LOGOUT', 'Auth', {}, req.ip);
      return res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao realizar logout' });
    }
  }
}

module.exports = new AuthController();

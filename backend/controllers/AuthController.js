const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const sequelize = require('../config/database');
const otplib = require('otplib');
const qrcode = require('qrcode');
const AuditService = require('../services/AuditService');
const MailService = require('../services/MailService');
require('dotenv').config();

class AuthController {
  async login(req, res) {
    try {
      const { email: rawEmail, password, trustedDeviceToken } = req.body;
      const email = rawEmail.toLowerCase();

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
        // Check if device is trusted
        const isTrusted = user.trustedDeviceToken && 
                         user.trustedDeviceToken === trustedDeviceToken && 
                         user.trustedDeviceExpires > new Date();

        if (!isTrusted) {
          const tempToken = jwt.sign({ id, role, isTemp: true }, process.env.JWT_SECRET, {
            expiresIn: '5m', // Short-lived
          });

          await AuditService.log(user.id, 'LOGIN_2FA_REQUIRED', 'Auth', { email }, req.ip);

          return res.json({
            twoFactorRequired: true,
            tempToken
          });
        }
        
        await AuditService.log(user.id, 'LOGIN_TRUSTED_DEVICE', 'Auth', { email }, req.ip);
      }

      await AuditService.log(user.id, 'LOGIN_SUCCESS', 'Auth', { email, role }, req.ip);

      return res.json({
        user: {
          id, name, email, role,
          avatar_url: user.avatar_url,
          hasReportAccess: user.hasReportAccess,
          hasAIAccess: user.hasAIAccess
        },
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
      const { tempToken, code, rememberDevice } = req.body;

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

      let newTrustedDeviceToken = null;
      if (rememberDevice) {
        newTrustedDeviceToken = require('crypto').randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setDate(expires.getDate() + 15); // 15 days
        await user.update({
          trustedDeviceToken: newTrustedDeviceToken,
          trustedDeviceExpires: expires
        });
      }

      await AuditService.log(user.id, '2FA_VERIFY_SUCCESS', 'Auth', { email: user.email, role }, req.ip);

      return res.json({
        user: { id, name, email, role },
        token: jwt.sign({ id, role }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        }),
        trustedDeviceToken: newTrustedDeviceToken
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

  registerClient = async (req, res) => {
    if (req.userRole !== 'admin' && req.userRole !== 'partner') {
      return res.status(403).json({ error: 'Only admins or partners can register clients' });
    }

    const {
      name, email, password, phone, cpf, income, occupation,
      financialGoal, customFields, onboardingData,
      hasReportAccess, hasAIAccess
    } = req.body;

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
      onboardingData: onboardingData || {},
      hasReportAccess: hasReportAccess || false,
      hasAIAccess: hasAIAccess || false
    });

    // Send Welcome Email
    try {
      await this.sendWelcomeEmail(user);
    } catch (emailErr) {
      console.error('Failed to send welcome email during registration:', emailErr);
    }

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
      attributes: [
        'id', 'name', 'email', 'phone', 'cpf', 'income', 'occupation',
        'financialGoal', 'customFields', 'onboardingData', 'isLead',
        'isActive', 'leadSource', 'partner_id', 'createdAt',
        'hasReportAccess', 'hasAIAccess'
      ],
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
      const {
        name, email, password, phone, cpf, income, occupation,
        financialGoal, customFields, onboardingData,
        hasReportAccess, hasAIAccess
      } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If partner, check if client belongs to them
      if (req.userRole === 'partner' && user.partner_id !== req.userId) {
        return res.status(403).json({ error: 'Este cliente não pertence à sua carteira' });
      }

      // Only update fields provided in the request body
      const fields = {
        name, email, phone, cpf, income, occupation,
        financialGoal, customFields, onboardingData,
        hasReportAccess, hasAIAccess
      };
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
      user: {
        id: user.id,
        name,
        email,
        role,
        hasReportAccess: user.hasReportAccess,
        hasAIAccess: user.hasAIAccess
      },
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

  async updateProfile(req, res) {
    try {
      const { name, email, current_password, new_password, avatar_url } = req.body;
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const updateData = {};

      if (name) updateData.name = name;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
          return res.status(400).json({ error: 'E-mail selecionado já está em uso' });
        }
        updateData.email = email;
      }

      if (new_password) {
        if (!current_password) {
          return res.status(400).json({ error: 'Senha atual é obrigatória para definir uma nova' });
        }
        if (!(await bcrypt.compare(current_password, user.password))) {
          return res.status(401).json({ error: 'Senha atual incorreta' });
        }
        updateData.password = await bcrypt.hash(new_password, 8);
      }

      await user.update(updateData);

      const { id, role, avatar_url: updatedAvatar } = user;

      return res.json({
        user: {
          id,
          name: user.name,
          email: user.email,
          role,
          avatar_url: updatedAvatar,
          hasReportAccess: user.hasReportAccess,
          hasAIAccess: user.hasAIAccess
        },
        token: jwt.sign({ id, role }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        }),
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }

  async getOnboardingData(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      return res.json(user.onboardingData || {});
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao buscar dados de onboarding' });
    }
  }

  sendWelcomeEmail = async (user) => {
    try {
      const email = user.email.toLowerCase();
      const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>2BI - Boas-vindas</title>
      </head>

      <body style="margin:0; padding:0; background:#050b14; font-family: Arial, Helvetica, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#050b14; padding:40px 16px;">
          <tr>
            <td align="center">

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; background:#0b1b33; border-radius:24px; overflow:hidden; border:1px solid rgba(212, 175, 85, 0.35); box-shadow:0 20px 60px rgba(0,0,0,0.45);">

                <!-- TOP BAR -->
                <tr>
                  <td style="background:linear-gradient(135deg, #06101f 0%, #102847 100%); padding:36px 32px 28px 32px; text-align:center;">
                    <img 
                      src="https://app.2biplanejamento.cloud/logo_2bi.png" 
                      alt="2BI Planejamento" 
                      width="130" 
                      style="display:block; margin:0 auto 24px auto;"
                    />

                    <div style="display:inline-block; padding:8px 16px; border-radius:999px; background:rgba(212,175,85,0.12); border:1px solid rgba(212,175,85,0.45); color:#d4af55; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;">
                      Acesso Liberado
                    </div>

                    <h1 style="margin:22px 0 10px 0; color:#ffffff; font-size:28px; line-height:1.2; font-weight:800;">
                      Bem-vindo à 2BI
                    </h1>

                    <p style="margin:0; color:#aab6c8; font-size:15px; line-height:1.6;">
                      Olá <strong style="color:#ffffff;">${user.name}</strong>, é um prazer ter você conosco. Sua conta foi configurada e está pronta para uso.
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding:38px 32px 28px 32px; text-align:center; background:#0b1b33;">
                    <p style="color:#ffffff; font-size:16px; margin-bottom:24px; font-weight:500;">
                      Acesse agora seu painel estratégico e acompanhe sua evolução financeira em tempo real.
                    </p>
                    
                    <a href="https://app.2biplanejamento.cloud/login" style="display:inline-block; padding:18px 42px; background:#d4af55; color:#050b14; text-decoration:none; border-radius:16px; font-weight:900; font-size:14px; text-transform:uppercase; letter-spacing:1px; box-shadow:0 10px 25px rgba(212, 175, 85, 0.3);">
                      Acessar Aplicativo
                    </a>

                    <p style="margin-top:24px; color:#748196; font-size:12px;">
                      Link de acesso: <a href="https://app.2biplanejamento.cloud/login" style="color:#d4af55; text-decoration:none;">app.2biplanejamento.cloud/login</a>
                    </p>
                  </td>
                </tr>

                <!-- INFO -->
                <tr>
                  <td style="padding:0 32px 36px 32px; text-align:center; background:#0b1b33;">
                    <p style="margin:0; color:#c9d3e3; font-size:14px; line-height:1.7;">
                      Utilize seu e-mail institucional e a senha cadastrada pelo seu consultor para realizar o primeiro login.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#071222; padding:26px 30px; text-align:center; border-top:1px solid rgba(212,175,85,0.18);">
                    <p style="margin:0 0 8px 0; color:#d4af55; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:2px;">
                      2BI Planejamento
                    </p>

                    <p style="margin:0; color:#748196; font-size:12px; line-height:1.6;">
                      Estratégia financeira, proteção patrimonial e visão de longo prazo.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

      await MailService.sendMail({
        to: email,
        subject: "Bem-vindo à 2BI Planejamento - Seu Acesso Exclusivo",
        text: `Olá ${user.name}, bem-vindo à 2BI Planejamento! Sua conta foi criada com sucesso. Acesse o aplicativo em: https://app.2biplanejamento.cloud/login`,
        html
      });

      return true;
    } catch (err) {
      console.error('MailSend Error (Welcome):', err);
      throw err;
    }
  }

  resendWelcomeEmail = async (req, res) => {
    if (req.userRole !== 'admin' && req.userRole !== 'partner') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (req.userRole === 'partner' && user.partner_id !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado a este cliente' });
      }

      await this.sendWelcomeEmail(user);
      await AuditService.log(req.userId, 'WELCOME_EMAIL_RESENT', 'Auth', { targetUserId: user.id, email: user.email }, req.ip);
      return res.json({ message: 'E-mail de boas-vindas reenviado com sucesso' });
    } catch (err) {
      console.error(err);
      const errorMessage = err.body?.message || err.message || 'Erro interno ao processar reenvio';
      return res.status(500).json({ error: errorMessage });
    }
  }

  async forgotPassword(req, res) {
    const { email: rawEmail } = req.body;
    const email = rawEmail.toLowerCase();

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Generate a 6-digit numeric token
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 5); // 5 minutes validity

      await user.update({
        resetPasswordToken: token,
        resetPasswordExpires: expires
      });

      const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>2BI - Código de Acesso</title>
      </head>

      <body style="margin:0; padding:0; background:#050b14; font-family: Arial, Helvetica, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#050b14; padding:40px 16px;">
          <tr>
            <td align="center">

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; background:#0b1b33; border-radius:24px; overflow:hidden; border:1px solid rgba(212, 175, 85, 0.35); box-shadow:0 20px 60px rgba(0,0,0,0.45);">

                <!-- TOP BAR -->
                <tr>
                  <td style="background:linear-gradient(135deg, #06101f 0%, #102847 100%); padding:36px 32px 28px 32px; text-align:center;">
                    <img 
                      src="https://app.2biplanejamento.cloud/logo_2bi.png" 
                      alt="2BI Planejamento" 
                      width="130" 
                      style="display:block; margin:0 auto 24px auto;"
                    />

                    <div style="display:inline-block; padding:8px 16px; border-radius:999px; background:rgba(212,175,85,0.12); border:1px solid rgba(212,175,85,0.45); color:#d4af55; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;">
                      Segurança 2BI
                    </div>

                    <h1 style="margin:22px 0 10px 0; color:#ffffff; font-size:28px; line-height:1.2; font-weight:800;">
                      Código de Acesso
                    </h1>

                    <p style="margin:0; color:#aab6c8; font-size:15px; line-height:1.6;">
                      Olá <strong style="color:#ffffff;">${user.name}</strong>, use o código abaixo para continuar com segurança.
                    </p>
                  </td>
                </tr>

                <!-- TOKEN -->
                <tr>
                  <td style="padding:38px 32px 28px 32px; text-align:center; background:#0b1b33;">
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="100%" style="background:linear-gradient(135deg, rgba(212,175,85,0.14), rgba(255,255,255,0.03)); border:1px solid rgba(212,175,85,0.6); border-radius:20px;">
                      <tr>
                        <td style="padding:30px 18px; text-align:center;">
                          <span style="display:block; color:#d4af55; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:3px; margin-bottom:14px;">
                            Token de verificação
                          </span>

                          <span style="display:block; color:#ffffff; font-size:44px; line-height:1; font-weight:900; letter-spacing:10px; font-family:'Courier New', Courier, monospace;">
                            ${token}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top:26px;">
                      <span style="display:inline-block; padding:9px 16px; border-radius:999px; background:rgba(255,76,76,0.12); border:1px solid rgba(255,76,76,0.35); color:#ff6969; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">
                        Expira em 5 minutos
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- INFO -->
                <tr>
                  <td style="padding:0 32px 36px 32px; text-align:center; background:#0b1b33;">
                    <p style="margin:0; color:#c9d3e3; font-size:14px; line-height:1.7;">
                      Este código protege sua conta e garante que apenas você tenha acesso às informações do seu planejamento financeiro.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#071222; padding:26px 30px; text-align:center; border-top:1px solid rgba(212,175,85,0.18);">
                    <p style="margin:0 0 8px 0; color:#d4af55; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:2px;">
                      2BI Planejamento
                    </p>

                    <p style="margin:0; color:#748196; font-size:12px; line-height:1.6;">
                      Estratégia financeira, proteção patrimonial e visão de longo prazo.
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;">
                <tr>
                  <td style="padding:24px 24px 0 24px; text-align:center;">
                    <p style="margin:0; color:#687386; font-size:11px; line-height:1.6;">
                      Se você não solicitou este código, ignore esta mensagem.  
                      Esta é uma comunicação oficial da 2BI Planejamento Estratégico.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

      await MailService.sendMail({
        to: email,
        subject: "Seu Código de Acesso Exclusivo - 2BI",
        text: `Seu código de recuperação 2BI é: ${token}. Este código expira em 5 minutos.`,
        html
      });

      return res.json({ message: 'Token enviado com sucesso' });
    } catch (err) {
      console.error('MailSend Error:', err);
      return res.status(500).json({ error: 'Erro ao processar solicitação de senha' });
    }
  }

  async resetPassword(req, res) {
    const { email: rawEmail, token, newPassword } = req.body;
    const email = rawEmail.toLowerCase();

    try {
      const user = await User.findOne({
        where: {
          email,
          resetPasswordToken: token
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Código inválido ou e-mail incorreto' });
      }

      if (new Date() > user.resetPasswordExpires) {
        return res.status(400).json({ error: 'O código expirou. Solicite um novo.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      await user.save();

      return res.json({ message: 'Senha redefinida com sucesso' });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
  }
}

module.exports = new AuthController();

const { Schedule, User } = require('../models');
const { Op } = require('sequelize');

class ScheduleController {
  async index(req, res) {
    try {
      const { userRole: role, userId } = req;
      let where = {};

      if (role === 'partner') {
        // Parceiro vê seus agendamentos E agendamentos de Admins (para ver disponibilidade)
        where = {
          [Op.or]: [
            { userId },
            { invitedAdminId: userId },
            { '$User.role$': 'admin' }
          ]
        };
      } else if (role === 'client') {
        // Cliente vê apenas seus agendamentos
        where = { clientId: userId };
      }
      // Admin não tem filtro (vê tudo)

      const schedules = await Schedule.findAll({
        where,
        include: [
          { model: User, as: 'User', attributes: ['id', 'name', 'role'] },
          { model: User, as: 'Client', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'InvitedAdmin', attributes: ['id', 'name'] }
        ],
        order: [['date', 'ASC']]
      });

      // Lógica de mascaramento para Parceiros
      if (role === 'partner') {
        const maskedSchedules = schedules.map(schedule => {
          // Se o agendamento NÃO é do parceiro e NÃO é um convite para ele
          // E o dono do agendamento é um Admin
          if (schedule.userId !== userId && schedule.invitedAdminId !== userId && schedule.User?.role === 'admin') {
            return {
              id: schedule.id,
              date: schedule.date,
              endDate: schedule.endDate,
              duration: schedule.duration,
              title: 'Ocupado (Admin)',
              status: schedule.status,
              isMasked: true // Flag para o frontend
            };
          }
          return schedule;
        });
        return res.json(maskedSchedules);
      }

      return res.json(schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return res.status(500).json({ error: 'Erro ao buscar agenda' });
    }
  }

  async store(req, res) {
    try {
      const { title, date, endDate, duration, description, clientId, clientName, invitedAdminId, meet_url } = req.body;
      const userId = req.userId;

      const schedule = await Schedule.create({
        title,
        date,
        endDate,
        duration,
        description,
        userId,
        clientId: clientId || null,
        clientName,
        invitedAdminId: invitedAdminId || null,
        meet_url,
        status: 'pending'
      });

      return res.status(201).json(schedule);
    } catch (error) {
      console.error('Error creating schedule:', error);
      return res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { userRole: role, userId } = req;
      const schedule = await Schedule.findByPk(id);

      if (!schedule) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Apenas o dono ou Admin pode editar
      if (schedule.userId !== userId && role !== 'admin') {
        return res.status(403).json({ error: 'Sem permissão para editar este agendamento' });
      }

      const { 
        title, date, endDate, duration, description, 
        clientId, clientName, invitedAdminId, meet_url, status 
      } = req.body;

      await schedule.update({
        title,
        date,
        endDate,
        duration,
        description,
        clientId: clientId || null,
        clientName,
        invitedAdminId: invitedAdminId || null,
        meet_url,
        status
      });

      return res.json(schedule);
    } catch (error) {
      console.error('Error updating schedule:', error);
      return res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const { userRole: role, userId } = req;
      const schedule = await Schedule.findByPk(id);

      if (!schedule) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Apenas o dono ou Admin pode excluir
      if (schedule.userId !== userId && role !== 'admin') {
        return res.status(403).json({ error: 'Sem permissão para excluir este agendamento' });
      }

      await schedule.destroy();

      return res.json({ message: 'Agendamento excluído com sucesso' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return res.status(500).json({ error: 'Erro ao excluir agendamento' });
    }
  }
}

module.exports = new ScheduleController();

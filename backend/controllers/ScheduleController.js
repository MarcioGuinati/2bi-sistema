const { Schedule, User, ScheduleParticipant } = require('../models');
const { Op } = require('sequelize');

class ScheduleController {
  async index(req, res) {
    try {
      const { userRole: role, userId } = req;
      const { clientId } = req.query; // Filtro opcional para o dashboard do cliente
      let where = {};

      if (clientId) {
        where.clientId = clientId;
      }

      const include = [
        { model: User, as: 'User', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'Client', attributes: ['id', 'name', 'email'] },
        { 
          model: User, 
          as: 'Participants', 
          attributes: ['id', 'name', 'role'],
          through: { attributes: [] } 
        }
      ];

      // Se for parceiro, precisamos filtrar o que ele pode ver sem máscara
      if (role === 'partner') {
        const schedules = await Schedule.findAll({
          where: clientId ? { clientId } : {}, // Se tiver clientId, busca direto (mascaramos depois se necessário)
          include,
          order: [['date', 'ASC']]
        });

        const sanitizedSchedules = schedules.map(s => {
          const isOwner = s.userId === userId;
          const isParticipant = s.Participants?.some(p => p.id === userId);
          const isAdminMeeting = s.User?.role === 'admin';

          // Se eu sou dono ou participante, vejo tudo
          if (isOwner || isParticipant) {
            return s;
          }

          // Se for uma reunião de Admin (e eu não participo), vejo como ocupado
          if (isAdminMeeting) {
            return {
              id: s.id,
              date: s.date,
              endDate: s.endDate,
              duration: s.duration,
              title: 'Ocupado (Admin)',
              status: s.status,
              isMasked: true
            };
          }

          // Outras reuniões de parceiros que eu não participo não devem aparecer na agenda geral
          // mas podem aparecer se estivermos listando por clientId no Dashboard do Admin.
          if (clientId) {
            return {
              id: s.id,
              date: s.date,
              title: 'Ocupado',
              isMasked: true
            };
          }

          return null;
        }).filter(Boolean);

        return res.json(sanitizedSchedules);
      }

      // Admin ou Client
      if (role === 'client') {
        where.clientId = userId;
      }

      const schedules = await Schedule.findAll({
        where,
        include,
        order: [['date', 'ASC']]
      });

      return res.json(schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return res.status(500).json({ error: 'Erro ao buscar agenda' });
    }
  }

  async store(req, res) {
    try {
      const { 
        title, date, endDate, duration, description, 
        clientId, clientName, participantIds, meet_url 
      } = req.body;
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
        meet_url,
        status: 'pending'
      });

      if (participantIds && Array.isArray(participantIds)) {
        await schedule.setParticipants(participantIds);
      }

      const fullSchedule = await Schedule.findByPk(schedule.id, {
        include: [
          { model: User, as: 'Participants', attributes: ['id', 'name', 'role'] }
        ]
      });

      return res.status(201).json(fullSchedule);
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
        clientId, clientName, participantIds, meet_url, status 
      } = req.body;

      await schedule.update({
        title,
        date,
        endDate,
        duration,
        description,
        clientId: clientId || null,
        clientName,
        meet_url,
        status
      });

      if (participantIds && Array.isArray(participantIds)) {
        await schedule.setParticipants(participantIds);
      }

      const updatedSchedule = await Schedule.findByPk(id, {
        include: [
          { model: User, as: 'Participants', attributes: ['id', 'name', 'role'] },
          { model: User, as: 'User', attributes: ['id', 'name', 'role'] },
          { model: User, as: 'Client', attributes: ['id', 'name'] }
        ]
      });

      return res.json(updatedSchedule);
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

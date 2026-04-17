const { Note, User } = require('../models');

class NoteController {
  async index(req, res) {
    const { userId } = req.params;

    const notes = await Note.findAll({
      where: { user_id: userId },
      include: [{ model: User, as: 'Admin', attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    });

    return res.json(notes);
  }

  async store(req, res) {
    const { userId } = req.params;
    const { content } = req.body;

    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const note = await Note.create({
      content,
      user_id: userId,
      admin_id: req.userId
    });

    return res.json(note);
  }

  async update(req, res) {
    const { id } = req.params;
    const { content } = req.body;

    const note = await Note.findByPk(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Only allow the admin who created the note or a superadmin?
    // For now, any admin since this is a CRM tool.
    await note.update({ content });

    return res.json(note);
  }

  async delete(req, res) {
    const { id } = req.params;
    const note = await Note.findByPk(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    await note.destroy();
    return res.send();
  }
}

module.exports = new NoteController();

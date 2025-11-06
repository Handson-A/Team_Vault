import mongoose from 'mongoose';
import Message from '../models/message.js';
import Team from '../models/team.js';

// POST / - create a new team vault message (req.params.teamId required via merged router)
export const postMessage = async (req, res) => {
  try {
    const { teamId } = req.params;
    let { content } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ msg: 'Invalid team id' });
    }

    content = typeof content === 'string' ? content.trim() : '';
    if (!content) return res.status(400).json({ msg: 'Content is required' });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    // membership check
    const isMember = team.members.some(m => String(m) === String(req.user));
    if (!isMember) return res.status(403).json({ msg: 'Only team members can post messages' });

    const message = await Message.create({ teamId, author: req.user, content });
    // populate author for response
    await message.populate('author', 'username email');
    res.status(201).json(message);
  } catch (error) {
    console.error('postMessage error:', error);
    res.status(500).json({ msg: 'Error posting message' });
  }
};

// GET / - get messages for a team (supports pagination)
export const getMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 100);
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ msg: 'Invalid team id' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    const isMember = team.members.some(m => String(m) === String(req.user));
    if (!isMember) return res.status(403).json({ msg: 'Only team members can view messages' });

    const [messages, total] = await Promise.all([
      Message.find({ teamId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', 'username email'),
      Message.countDocuments({ teamId }),
    ]);

    res.json({ page, limit, total, messages });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ msg: 'Error fetching messages' });
  }
};

// GET /:vaultId - get a specific team vault message
export const getMessage = async (req, res) => {
  try {
    const { teamId, vaultId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(vaultId)) {
      return res.status(400).json({ msg: 'Invalid id' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    const isMember = team.members.some(m => String(m) === String(req.user));
    if (!isMember) return res.status(403).json({ msg: 'Only team members can view messages' });

    const message = await Message.findOne({ _id: vaultId, teamId }).populate('author', 'username email');
    if (!message) return res.status(404).json({ msg: 'Message not found' });

    res.json(message);
  } catch (error) {
    console.error('getMessage error:', error);
    res.status(500).json({ msg: 'Error fetching message' });
  }
};

// DELETE /:vaultId - delete a team vault message (author or team owner can delete)
export const deleteMessage = async (req, res) => {
  try {
    const { teamId, vaultId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(vaultId)) {
      return res.status(400).json({ msg: 'Invalid id' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    const message = await Message.findOne({ _id: vaultId, teamId });
    if (!message) return res.status(404).json({ msg: 'Message not found' });

    // allow deletion by message author or team owner
    const isAuthor = String(message.author) === String(req.user);
    const isOwner = String(team.createdBy) === String(req.user);
    if (!isAuthor && !isOwner) return res.status(403).json({ msg: 'Not authorized to delete this message' });

    await message.remove();
    res.json({ msg: 'Message deleted' });
  } catch (error) {
    console.error('deleteMessage error:', error);
    res.status(500).json({ msg: 'Error deleting message' });
  }
};

import mongoose from 'mongoose';
import Message from '../models/message.js';
import Team from '../models/team.js';
import { decrypt } from '../utils/crypto.js';

// Helper to format message with decrypted content and audit details
const formatMessageResponse = (msg) => {
  const obj = msg.toObject ? msg.toObject() : { ...msg };
  obj.content = decrypt(obj.content);
  return obj;
};

// POST / - create a new team vault message/secret (encrypted via model pre-save hook)
export const postMessage = async (req, res) => {
  try {
    const { teamId } = req.params;
    let { title, content, category } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid team id' });
    }

    content = typeof content === 'string' ? content.trim() : '';
    if (!content) {
      return res.status(400).json({ message: 'Secret content is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // membership check
    const isMember = team.members.some((m) => String(m) === String(req.user._id));
    if (!isMember) {
      return res.status(403).json({ message: 'Only team members can post secrets/messages' });
    }

    const validCategories = ['Password', 'Note', 'API_Key', 'File_Link', 'Other'];
    const selectedCategory = validCategories.includes(category) ? category : 'Note';

    const message = new Message({
      teamId,
      author: req.user._id,
      title: title && title.trim() ? title.trim() : 'Untitled Secret',
      content, // will be encrypted in pre-save hook
      category: selectedCategory,
      auditLog: [
        {
          userId: req.user._id,
          action: 'CREATED',
          timestamp: new Date(),
        },
      ],
      lastViewedAt: new Date(),
      lastViewedBy: req.user._id,
    });

    await message.save();
    await message.populate('author', 'username email');

    res.status(201).json(formatMessageResponse(message));
  } catch (error) {
    console.error('postMessage error:', error);
    res.status(500).json({ message: error.message || 'Error posting secret' });
  }
};

// GET / - get secrets/messages for a team with pagination (decrypts content and logs access)
export const getMessages = async (req, res) => {
  try {
    const { teamId } = req.params;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 100);
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid team id' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isMember = team.members.some((m) => String(m) === String(req.user._id));
    if (!isMember) {
      return res.status(403).json({ message: 'Only team members can view secrets/messages' });
    }

    const [rawMessages, total] = await Promise.all([
      Message.find({ teamId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username email'),
      Message.countDocuments({ teamId }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    // Decrypt messages on read
    const messages = rawMessages.map(formatMessageResponse);

    res.json({
      page,
      limit,
      total,
      totalPages,
      messages,
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ message: 'Error fetching secrets' });
  }
};

// GET /:vaultId - get single secret/message (records audit log entry)
export const getMessage = async (req, res) => {
  try {
    const { teamId, vaultId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(vaultId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isMember = team.members.some((m) => String(m) === String(req.user._id));
    if (!isMember) {
      return res.status(403).json({ message: 'Only team members can view secrets' });
    }

    const message = await Message.findOne({ _id: vaultId, teamId }).populate(
      'author',
      'username email'
    );
    if (!message) return res.status(404).json({ message: 'Secret/message not found' });

    // Record audit access
    message.auditLog.push({
      userId: req.user._id,
      action: 'VIEWED',
      timestamp: new Date(),
    });
    message.lastViewedAt = new Date();
    message.lastViewedBy = req.user._id;
    await message.save();

    res.json(formatMessageResponse(message));
  } catch (error) {
    console.error('getMessage error:', error);
    res.status(500).json({ message: 'Error fetching secret' });
  }
};

// PUT /:vaultId - update secret content (author or team owner only)
export const updateMessage = async (req, res) => {
  try {
    const { teamId, vaultId } = req.params;
    const { title, content, category } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(vaultId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const message = await Message.findOne({ _id: vaultId, teamId });
    if (!message) return res.status(404).json({ message: 'Secret/message not found' });

    const isAuthor = String(message.author) === String(req.user._id);
    const isOwner = String(team.createdBy) === String(req.user._id);
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to edit this secret' });
    }

    if (title !== undefined) message.title = title.trim();
    if (content !== undefined) message.content = content; // pre-save will encrypt
    if (category !== undefined) {
      const validCategories = ['Password', 'Note', 'API_Key', 'File_Link', 'Other'];
      if (validCategories.includes(category)) {
        message.category = category;
      }
    }

    message.auditLog.push({
      userId: req.user._id,
      action: 'UPDATED',
      timestamp: new Date(),
    });

    await message.save();
    await message.populate('author', 'username email');

    res.json(formatMessageResponse(message));
  } catch (error) {
    console.error('updateMessage error:', error);
    res.status(500).json({ message: 'Error updating secret' });
  }
};

// DELETE /:vaultId - delete secret (author or team owner only)
export const deleteMessage = async (req, res) => {
  try {
    const { teamId, vaultId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(vaultId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const message = await Message.findOne({ _id: vaultId, teamId });
    if (!message) return res.status(404).json({ message: 'Secret/message not found' });

    const isAuthor = String(message.author) === String(req.user._id);
    const isOwner = String(team.createdBy) === String(req.user._id);
    if (!isAuthor && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this secret' });
    }

    await Message.findByIdAndDelete(vaultId);
    res.json({ message: 'Secret deleted successfully' });
  } catch (error) {
    console.error('deleteMessage error:', error);
    res.status(500).json({ message: 'Error deleting secret' });
  }
};

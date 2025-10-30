import express from 'express';
import Vault from '../models/vault.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create vault item
router.post('/', protect, async (req, res) => {
  try {
    const newItem = await Vault.create({
      user: req.user,
      title: req.body.title,
      content: req.body.content,
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ msg: 'Error creating vault item', error });
  }
});

// Fetch user's vault items
router.get('/', protect, async (req, res) => {
  try {
    const items = await Vault.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching vault items', error });
  }
});

export default router;

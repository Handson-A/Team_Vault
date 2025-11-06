import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  postMessage,
  getMessages,
  getMessage,
  deleteMessage,
} from '../controllers/messageController.js';

const router = express.Router({ mergeParams: true });

// POST  /api/team/:teamId/vault/         -> create message
// GET   /api/team/:teamId/vault/         -> list messages (pagination)
// GET   /api/team/:teamId/vault/:vaultId -> get single message
// DELETE/api/team/:teamId/vault/:vaultId -> delete message
router.post('/', protect, postMessage);
router.get('/', protect, getMessages);
router.get('/:vaultId', protect, getMessage);
router.delete('/:vaultId', protect, deleteMessage);

export default router;

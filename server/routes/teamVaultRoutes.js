import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  postMessage,
  getMessages,
  getMessage,
  updateMessage,
  deleteMessage,
} from '../controllers/messageController.js';

const router = express.Router({ mergeParams: true });

// POST   /api/team/:teamId/vault/         -> create secret/message
// GET    /api/team/:teamId/vault/         -> list secrets/messages (pagination)
// GET    /api/team/:teamId/vault/:vaultId -> get single secret/message
// PUT    /api/team/:teamId/vault/:vaultId -> update secret/message (author/owner)
// DELETE /api/team/:teamId/vault/:vaultId -> delete secret/message (author/owner)
router.post('/', protect, postMessage);
router.get('/', protect, getMessages);
router.get('/:vaultId', protect, getMessage);
router.put('/:vaultId', protect, updateMessage);
router.delete('/:vaultId', protect, deleteMessage);

export default router;

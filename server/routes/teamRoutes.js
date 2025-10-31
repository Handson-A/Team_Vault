import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createTeam, getUserTeams, addMember, removeMember } from '../controllers/teamController.js';

const router = express.Router();

// Create team
router.post('/', protect, createTeam);

// Get teams for logged in user
router.get('/', protect, getUserTeams);

// Add member by email
router.post('/:id/add-member', protect, addMember);

// Remove member (optional)
router.delete('/:id/remove-member', protect, removeMember);

export default router;

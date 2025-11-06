import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createTeam, getUserTeams, addMember, removeMember } from '../controllers/teamController.js';
import teamVaultRoutes from './teamVaultRoutes.js';

const router = express.Router();

// Create team
router.post('/', protect, createTeam);

// Get teams for logged in user
router.get('/', protect, getUserTeams);

// Add member by email
router.post('/:teamId/add-member', protect, addMember);

// Remove member (optional)
router.delete('/:teamId/remove-member', protect, removeMember);

// Nested shared vault routes: /api/team/:teamId/vault/
router.use('/:teamId/vault', teamVaultRoutes);

export default router;

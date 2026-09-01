import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTeam,
  getUserTeams,
  getTeamById,
  joinTeam,
  addMember,
  removeMember,
  leaveTeam,
  deleteTeam,
} from '../controllers/teamController.js';
import teamVaultRoutes from './teamVaultRoutes.js';

const router = express.Router();

// Create team
router.post('/', protect, createTeam);

// Get teams for logged in user
router.get('/', protect, getUserTeams);

// Join team via joinCode or teamId
router.post('/join', protect, joinTeam);

// Get single team details
router.get('/:teamId', protect, getTeamById);

// Add member by email or ID (Owner only)
router.post('/:teamId/add-member', protect, addMember);

// Remove member (Owner only)
router.delete('/:teamId/remove-member', protect, removeMember);

// Leave team (Non-owner member)
router.post('/:teamId/leave', protect, leaveTeam);

// Delete team (Owner only)
router.delete('/:teamId', protect, deleteTeam);

// Nested shared vault routes: /api/team/:teamId/vault/
router.use('/:teamId/vault', teamVaultRoutes);

export default router;

import mongoose from 'mongoose';
import Team from '../models/team.js';
import User from '../models/user.js';

// Create team
export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const newTeam = new Team({
      name: name.trim(),
      description: description ? description.trim() : '',
      createdBy: req.user._id,
      members: [req.user._id],
    });

    await newTeam.save();
    await newTeam.populate('members', 'username email');
    await newTeam.populate('createdBy', 'username email');

    res.status(201).json(newTeam);
  } catch (error) {
    console.error('createTeam error:', error);
    res.status(500).json({ message: error.message || 'Error creating team' });
  }
};

// Get teams the logged-in user belongs to
export const getUserTeams = async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user._id })
      .sort({ createdAt: -1 })
      .populate('members', 'username email')
      .populate('createdBy', 'username email');
    res.json(teams);
  } catch (error) {
    console.error('getUserTeams error:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

// Get single team details
export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    const team = await Team.findById(teamId)
      .populate('members', 'username email')
      .populate('createdBy', 'username email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some(
      (m) => String(m._id || m) === String(req.user._id)
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this team' });
    }

    res.json(team);
  } catch (error) {
    console.error('getTeamById error:', error);
    res.status(500).json({ message: 'Error fetching team details' });
  }
};

// Join team using joinCode or teamId
export const joinTeam = async (req, res) => {
  try {
    const { joinCode, teamId } = req.body || {};
    if (!joinCode && !teamId) {
      return res.status(400).json({ message: 'Join code or team ID is required' });
    }

    let query = {};
    if (joinCode) {
      query = { joinCode: joinCode.trim().toUpperCase() };
    } else if (teamId && mongoose.Types.ObjectId.isValid(teamId)) {
      query = { _id: teamId };
    } else {
      return res.status(400).json({ message: 'Invalid join parameters' });
    }

    const team = await Team.findOne(query);
    if (!team) {
      return res.status(404).json({ message: 'Team not found with the provided code or ID' });
    }

    const isAlreadyMember = team.members.some(
      (m) => String(m) === String(req.user._id)
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this team' });
    }

    team.members.push(req.user._id);
    await team.save();
    await team.populate('members', 'username email');
    await team.populate('createdBy', 'username email');

    res.json({ message: 'Successfully joined team', team });
  } catch (error) {
    console.error('joinTeam error:', error);
    res.status(500).json({ message: 'Error joining team' });
  }
};

// Add member by email or userId (Owner only)
export const addMember = async (req, res) => {
  try {
    const teamId = req.params.teamId || req.params.id;
    const { email, userId } = req.body || {};
    if (!email && !userId) {
      return res.status(400).json({ message: 'User email or ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Only owner can add members
    if (String(team.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the team owner can add members' });
    }

    let userToAdd;
    if (email) {
      userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    } else if (userId) {
      userToAdd = await User.findById(userId);
    }

    if (!userToAdd) {
      return res.status(404).json({ message: 'User to add not found' });
    }

    // prevent duplicate
    if (team.members.some((m) => String(m) === String(userToAdd._id))) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    team.members.push(userToAdd._id);
    await team.save();
    await team.populate('members', 'username email');
    await team.populate('createdBy', 'username email');

    res.json(team);
  } catch (error) {
    console.error('addMember error:', error);
    res.status(500).json({ message: 'Error adding member' });
  }
};

// Remove member (Owner only)
export const removeMember = async (req, res) => {
  try {
    const teamId = req.params.teamId || req.params.id;
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (String(team.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only team owner can remove members' });
    }

    if (String(team.createdBy) === String(userId)) {
      return res.status(400).json({ message: 'Cannot remove the team owner. Delete team or transfer ownership instead.' });
    }

    team.members = team.members.filter((m) => String(m) !== String(userId));
    await team.save();
    await team.populate('members', 'username email');
    await team.populate('createdBy', 'username email');

    res.json(team);
  } catch (error) {
    console.error('removeMember error:', error);
    res.status(500).json({ message: 'Error removing member' });
  }
};

// Leave team (Member removes self; owner cannot leave without deleting)
export const leaveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (String(team.createdBy) === String(req.user._id)) {
      return res.status(400).json({ message: 'Team owners cannot leave the team. You may delete the team instead.' });
    }

    const isMember = team.members.some((m) => String(m) === String(req.user._id));
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }

    team.members = team.members.filter((m) => String(m) !== String(req.user._id));
    await team.save();

    res.json({ message: 'Successfully left the team' });
  } catch (error) {
    console.error('leaveTeam error:', error);
    res.status(500).json({ message: 'Error leaving team' });
  }
};

// Delete team (Owner only)
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (String(team.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the team owner can delete the team' });
    }

    await Team.findByIdAndDelete(teamId);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('deleteTeam error:', error);
    res.status(500).json({ message: 'Error deleting team' });
  }
};

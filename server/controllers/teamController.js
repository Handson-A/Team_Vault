import Team from '../models/team.js';
import User from '../models/user.js';

// Create team.
export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ msg: 'Team name is required' });

    const newTeam = new Team({ name, description, createdBy: req.user, members: [req.user] });
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (error) {
    console.error('createTeam error:', error);
    res.status(500).json({ msg: 'Error creating team' });
  }
};

// Get teams the logged-in user belongs to
export const getUserTeams = async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user }).sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    console.error('getUserTeams error:', error);
    res.status(500).json({ msg: 'Error fetching teams' });
  }
};

// Add member by email. Only team owner (createdBy) or admin can add members.
export const addMember = async (req, res) => {
  try {
  const teamId = req.params.teamId || req.params.id;
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    // only owner (createdBy) can add members — admin role check optional
    if (String(team.createdBy) !== String(req.user)) {
      // allow admin users
      const requester = await User.findById(req.user);
      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ msg: 'Only team owner or admin can add members' });
      }
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ msg: 'User not found' });

    // prevent duplicate
    if (team.members.find(m => String(m) === String(userToAdd._id))) {
      return res.status(400).json({ msg: 'User already a member' });
    }

    team.members.push(userToAdd._id);
    await team.save();
    res.json(team);
  } catch (error) {
    console.error('addMember error:', error);
    res.status(500).json({ msg: 'Error adding member' });
  }
};

// Remove member. Only owner can remove. Prevent removing owner.
export const removeMember = async (req, res) => {
  try {
  const teamId = req.params.teamId || req.params.id;
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ msg: 'userId is required' });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ msg: 'Team not found' });

    if (String(team.createdBy) !== String(req.user)) {
      return res.status(403).json({ msg: 'Only team owner can remove members' });
    }

    if (String(team.createdBy) === String(userId)) {
      return res.status(400).json({ msg: 'Cannot remove team owner' });
    }

    team.members = team.members.filter(m => String(m) !== String(userId));
    await team.save();
    res.json(team);
  } catch (error) {
    console.error('removeMember error:', error);
    res.status(500).json({ msg: 'Error removing member' });
  }
};

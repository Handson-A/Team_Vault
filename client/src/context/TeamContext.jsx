import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const TeamContext = createContext(null);

export const TeamProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/team');
      setTeams(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeamDetails = useCallback(async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/team/${teamId}`);
      setCurrentTeam(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = async (name, description) => {
    setError(null);
    try {
      const newTeam = await api.post('/team', { name, description });
      setTeams((prev) => [newTeam, ...prev]);
      return newTeam;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const joinTeam = async (joinCode) => {
    setError(null);
    try {
      const res = await api.post('/team/join', { joinCode });
      const joinedTeam = res.team || res;
      setTeams((prev) => [joinedTeam, ...prev.filter((t) => t._id !== joinedTeam._id)]);
      return joinedTeam;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addMember = async (teamId, email) => {
    setError(null);
    try {
      const updatedTeam = await api.post(`/team/${teamId}/add-member`, { email });
      setTeams((prev) => prev.map((t) => (t._id === teamId ? updatedTeam : t)));
      if (currentTeam && currentTeam._id === teamId) {
        setCurrentTeam(updatedTeam);
      }
      return updatedTeam;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeMember = async (teamId, userId) => {
    setError(null);
    try {
      const updatedTeam = await api.delete(`/team/${teamId}/remove-member`, { userId });
      setTeams((prev) => prev.map((t) => (t._id === teamId ? updatedTeam : t)));
      if (currentTeam && currentTeam._id === teamId) {
        setCurrentTeam(updatedTeam);
      }
      return updatedTeam;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const leaveTeam = async (teamId) => {
    setError(null);
    try {
      await api.post(`/team/${teamId}/leave`, {});
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
      if (currentTeam && currentTeam._id === teamId) {
        setCurrentTeam(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTeam = async (teamId) => {
    setError(null);
    try {
      await api.delete(`/team/${teamId}`);
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
      if (currentTeam && currentTeam._id === teamId) {
        setCurrentTeam(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    teams,
    currentTeam,
    loading,
    error,
    fetchTeams,
    fetchTeamDetails,
    createTeam,
    joinTeam,
    addMember,
    removeMember,
    leaveTeam,
    deleteTeam,
    setCurrentTeam,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export default TeamContext;
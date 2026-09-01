import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const VaultContext = createContext(null);

export const VaultProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVaultMessages = useCallback(async (teamId, page = 1, limit = 25) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/team/${teamId}/vault?page=${page}&limit=${limit}`);
      setMessages(data.messages || []);
      setPagination({
        page: data.page || page,
        limit: data.limit || limit,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addVaultMessage = async (teamId, payload) => {
    setError(null);
    try {
      const newMessage = await api.post(`/team/${teamId}/vault`, payload);
      setMessages((prev) => [newMessage, ...prev]);
      setPagination((prev) => ({
        ...prev,
        total: prev.total + 1,
        totalPages: Math.ceil((prev.total + 1) / prev.limit) || 1,
      }));
      return newMessage;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateVaultMessage = async (teamId, vaultId, payload) => {
    setError(null);
    try {
      const updatedMessage = await api.put(`/team/${teamId}/vault/${vaultId}`, payload);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === vaultId ? updatedMessage : msg))
      );
      return updatedMessage;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteVaultMessage = async (teamId, vaultId) => {
    setError(null);
    try {
      await api.delete(`/team/${teamId}/vault/${vaultId}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== vaultId));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        totalPages: Math.ceil(Math.max(0, prev.total - 1) / prev.limit) || 1,
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    messages,
    pagination,
    loading,
    error,
    fetchVaultMessages,
    addVaultMessage,
    updateVaultMessage,
    deleteVaultMessage,
    setMessages,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};

export default VaultContext;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TeamProvider } from './context/TeamContext';
import { VaultProvider } from './context/VaultContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamDashboard from './pages/TeamDashboard';
import TeamVault from './pages/TeamVault';

import './styles/globals.css';
import './styles/layout.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/vault.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TeamProvider>
          <VaultProvider>
            <div className="app-layout">
              <Navbar />
              <div className="main-content">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Navigate to="/teams" replace />} />
                    <Route path="/teams" element={<TeamDashboard />} />
                    <Route path="/teams/:teamId/vault" element={<TeamVault />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/teams" replace />} />
                </Routes>
              </div>
            </div>
          </VaultProvider>
        </TeamProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

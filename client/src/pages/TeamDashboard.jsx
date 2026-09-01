import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Building2,
  ChevronUp,
  ChevronDown,
  Plus,
  KeyRound,
  Crown,
  Lock,
  Copy,
  Check,
  UserPlus,
  X,
  AlertCircle,
} from 'lucide-react';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';

const TeamDashboard = () => {
  const { user } = useAuth();
  const {
    teams,
    currentTeam,
    fetchTeams,
    fetchTeamDetails,
    createTeam,
    joinTeam,
    addMember,
    removeMember,
    leaveTeam,
    deleteTeam,
    setCurrentTeam,
  } = useTeam();

  const navigate = useNavigate();

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Forms state
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [modalError, setModalError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Toast & Copy state
  const [toastMessage, setToastMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    fetchTeams().then((data) => {
      if (data && data.length > 0 && !currentTeam) {
        fetchTeamDetails(data[0]._id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTeams]);

  const handleSelectTeam = (teamId) => {
    fetchTeamDetails(teamId);
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setModalError('Team name is required');
      return;
    }
    setActionLoading(true);
    setModalError('');
    try {
      const created = await createTeam(createForm.name, createForm.description);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '' });
      await fetchTeamDetails(created._id);
      showToast(`Team "${created.name}" created successfully!`);
    } catch (err) {
      setModalError(err.message || 'Failed to create team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTeamSubmit = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      setModalError('Please enter a team join code');
      return;
    }
    setActionLoading(true);
    setModalError('');
    try {
      const joined = await joinTeam(joinCodeInput.trim());
      setShowJoinModal(false);
      setJoinCodeInput('');
      await fetchTeamDetails(joined._id);
      showToast(`Joined team "${joined.name}" successfully!`);
    } catch (err) {
      setModalError(err.message || 'Failed to join team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!addMemberEmail.trim() || !currentTeam) return;
    setActionLoading(true);
    setModalError('');
    try {
      await addMember(currentTeam._id, addMemberEmail.trim());
      setShowAddMemberModal(false);
      setAddMemberEmail('');
      showToast('Team member added successfully!');
    } catch (err) {
      setModalError(err.message || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;
    try {
      await removeMember(currentTeam._id, userId);
      showToast(`${memberName} was removed from the team.`);
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await leaveTeam(currentTeam._id);
      showToast('You have left the team.');
      const remaining = teams.filter((t) => t._id !== currentTeam._id);
      if (remaining.length > 0) {
        fetchTeamDetails(remaining[0]._id);
      } else {
        setCurrentTeam(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to leave team');
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Warning: Deleting this team will remove all secrets permanently! Continue?')) return;
    try {
      await deleteTeam(currentTeam._id);
      showToast('Team deleted.');
      const remaining = teams.filter((t) => t._id !== currentTeam._id);
      if (remaining.length > 0) {
        fetchTeamDetails(remaining[0]._id);
      } else {
        setCurrentTeam(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete team');
    }
  };

  const copyJoinCode = () => {
    if (!currentTeam?.joinCode) return;
    navigator.clipboard.writeText(currentTeam.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast(`Join code "${currentTeam.joinCode}" copied to clipboard!`);
  };

  const isOwner = currentTeam && (
    String(currentTeam.createdBy?._id || currentTeam.createdBy) === String(user?._id || user?.id)
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Mobile Top Workspace Selector Bar */}
      <div className="dashboard-mobile-bar">
        <button
          className="btn-secondary dashboard-drawer-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle team workspaces drawer"
        >
          <Building2 size={18} />
          <span className="mobile-bar-team-name">
            {currentTeam ? currentTeam.name : 'Select Team Workspace'}
          </span>
          <span className="drawer-arrow">
            {mobileSidebarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        <div className="mobile-bar-actions">
          <button
            onClick={() => { setShowCreateModal(true); setModalError(''); }}
            className="btn-primary"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
            title="Create Team"
            aria-label="Create Team"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => { setShowJoinModal(true); setModalError(''); }}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
            title="Join Team"
            aria-label="Join Team with code"
          >
            <KeyRound size={16} />
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop view & Mobile Collapsible Drawer) */}
      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-section-title">Team Workspaces</div>

        <div className="sidebar-actions">
          <button
            onClick={() => { setShowCreateModal(true); setModalError(''); setMobileSidebarOpen(false); }}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            <Plus size={16} />
            <span>Create Team</span>
          </button>
          <button
            onClick={() => { setShowJoinModal(true); setModalError(''); setMobileSidebarOpen(false); }}
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            <KeyRound size={16} />
            <span>Join with Code</span>
          </button>
        </div>

        <div className="sidebar-section-title" style={{ marginTop: '10px' }}>
          Your Teams ({teams.length})
        </div>

        <div className="team-list">
          {teams.length === 0 ? (
            <div className="team-list-empty">
              You haven't joined any teams yet. Create or join one above!
            </div>
          ) : (
            teams.map((t) => (
              <button
                key={t._id}
                onClick={() => { handleSelectTeam(t._id); setMobileSidebarOpen(false); }}
                className={`team-list-item ${currentTeam?._id === t._id ? 'active' : ''}`}
              >
                <span className="team-list-item-name">{t.name}</span>
                {String(t.createdBy?._id || t.createdBy) === String(user?._id || user?.id) && (
                  <span className="badge badge-owner">
                    <Crown size={12} />
                    <span>Owner</span>
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main">
        {currentTeam ? (
          <div className="team-overview-card">
            {/* Header */}
            <div className="team-overview-header">
              <div className="team-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1>{currentTeam.name}</h1>
                  {isOwner ? (
                    <span className="badge badge-owner">
                      <Crown size={12} />
                      <span>You own this team</span>
                    </span>
                  ) : (
                    <span className="badge badge-member">Member</span>
                  )}
                </div>
                <p className="team-description">
                  {currentTeam.description || 'No description provided for this team.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {isOwner ? (
                  <button onClick={handleDeleteTeam} className="btn-danger-outline">
                    Delete Team
                  </button>
                ) : (
                  <button onClick={handleLeaveTeam} className="btn-danger-outline">
                    Leave Team
                  </button>
                )}
              </div>
            </div>

            {/* Primary Action CTA */}
            <div className="team-cta-bar">
              <div className="cta-text">
                <h3>Shared Team Secrets Vault</h3>
                <p>Access credentials, API keys, passwords, and sensitive notes safely.</p>
              </div>
              <button
                onClick={() => navigate(`/teams/${currentTeam._id}/vault`)}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '1rem' }}
              >
                <Lock size={18} />
                <span>Enter Shared Team Vault</span>
              </button>
            </div>

            {/* Join Code Box */}
            <div className="join-code-box">
              <div className="join-code-info">
                <span className="join-code-label">Team Invite Join Code</span>
                <span className="join-code-val">{currentTeam.joinCode || 'N/A'}</span>
              </div>
              <button
                onClick={copyJoinCode}
                className="btn-secondary"
                title="Copy to clipboard"
                aria-label="Copy team invite join code"
              >
                {copiedCode ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Members Section */}
            <div className="team-members-section">
              <div className="members-section-header">
                <h3>Team Members ({currentTeam.members?.length || 0})</h3>
                {isOwner && (
                  <button
                    onClick={() => { setShowAddMemberModal(true); setModalError(''); }}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <UserPlus size={15} />
                    <span>Add Member</span>
                  </button>
                )}
              </div>

              <div className="members-grid">
                {currentTeam.members?.map((m) => {
                  const memberId = m._id || m;
                  const memberName = m.username || 'Team Member';
                  const memberEmail = m.email || '';
                  const isMemberOwner = String(memberId) === String(currentTeam.createdBy?._id || currentTeam.createdBy);
                  const isSelf = String(memberId) === String(user?._id || user?.id);

                  return (
                    <div key={memberId} className="member-card">
                      <div className="member-info">
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {memberName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="member-details">
                          <span className="member-name">
                            {memberName} {isSelf ? '(You)' : ''}
                          </span>
                          <span className="member-email">{memberEmail}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isMemberOwner ? (
                          <span className="badge badge-owner">
                            <Crown size={12} />
                            <span>Owner</span>
                          </span>
                        ) : (
                          <span className="badge badge-member">Member</span>
                        )}

                        {isOwner && !isMemberOwner && (
                          <button
                            onClick={() => handleRemoveMember(memberId, memberName)}
                            className="btn-danger-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center' }}
                            title="Remove Member"
                            aria-label={`Remove ${memberName} from team`}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="no-team-selected">
            <div className="no-team-icon">
              <Building2 size={48} strokeWidth={1.5} />
            </div>
            <h2>No Team Workspace Selected</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
              Select a team from the left sidebar, create a new team, or join an existing team using a 8-character join code.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Plus size={16} />
                <span>Create New Team</span>
              </button>
              <button onClick={() => setShowJoinModal(true)} className="btn-secondary">
                <KeyRound size={16} />
                <span>Join with Code</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Create Team */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Team</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTeamSubmit}>
              <div className="modal-body">
                {modalError && (
                  <div className="auth-error-alert">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{modalError}</span>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="team-name">Team Name</label>
                  <input
                    id="team-name"
                    type="text"
                    placeholder="e.g. Infrastructure & DevOps"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="team-desc">Description (Optional)</label>
                  <textarea
                    id="team-desc"
                    rows="3"
                    placeholder="What does this team manage?"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Team */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Join Team with Code</h3>
              <button className="modal-close" onClick={() => setShowJoinModal(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleJoinTeamSubmit}>
              <div className="modal-body">
                {modalError && (
                  <div className="auth-error-alert">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{modalError}</span>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="join-code">8-Character Join Code</label>
                  <input
                    id="join-code"
                    type="text"
                    placeholder="e.g. 9B3A7F2D"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    required
                    maxLength={16}
                    style={{ fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Joining...' : 'Join Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Member */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Member to Team</h3>
              <button className="modal-close" onClick={() => setShowAddMemberModal(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMemberSubmit}>
              <div className="modal-body">
                {modalError && (
                  <div className="auth-error-alert">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{modalError}</span>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="member-email">User Email Address</label>
                  <input
                    id="member-email"
                    type="email"
                    placeholder="teammate@company.com"
                    value={addMemberEmail}
                    onChange={(e) => setAddMemberEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddMemberModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
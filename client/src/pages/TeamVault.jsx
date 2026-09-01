import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowLeft,
  Lock,
  Plus,
  X,
  Inbox,
  KeyRound,
  FileKey,
  StickyNote,
  Link as LinkIcon,
  Tag,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';

const TeamVault = () => {
  const { teamId } = useParams();
  const { user } = useAuth();
  const { currentTeam, fetchTeamDetails } = useTeam();
  const {
    messages,
    pagination,
    loading,
    fetchVaultMessages,
    addVaultMessage,
    deleteVaultMessage,
  } = useVault();

  // Show / Hide mask state map { [msgId]: boolean }
  const [unmaskedMap, setUnmaskedMap] = useState({});

  // Add Secret Form state
  const [isAddingSecret, setIsAddingSecret] = useState(false);
  const [secretForm, setSecretForm] = useState({
    title: '',
    category: 'Note',
    content: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast feedback & copied item state
  const [toastMessage, setToastMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails(teamId);
      fetchVaultMessages(teamId, 1, 25);
    }
  }, [teamId, fetchTeamDetails, fetchVaultMessages]);

  const toggleMask = (msgId) => {
    setUnmaskedMap((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const copyToClipboard = (content, title, id) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`Copied "${title || 'Secret'}" to clipboard!`);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Password':
        return <KeyRound size={12} />;
      case 'API_Key':
        return <FileKey size={12} />;
      case 'Note':
        return <StickyNote size={12} />;
      case 'File_Link':
        return <LinkIcon size={12} />;
      default:
        return <Tag size={12} />;
    }
  };

  const handleAddSecretSubmit = async (e) => {
    e.preventDefault();
    if (!secretForm.content.trim()) {
      setFormError('Secret content is required');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    try {
      await addVaultMessage(teamId, {
        title: secretForm.title.trim() || 'Untitled Secret',
        category: secretForm.category,
        content: secretForm.content.trim(),
      });
      setSecretForm({ title: '', category: 'Note', content: '' });
      setIsAddingSecret(false);
      showToast('Secret stored in vault successfully!');
    } catch (err) {
      setFormError(err.message || 'Failed to save secret');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSecret = async (vaultId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this secret'}"?`)) return;
    try {
      await deleteVaultMessage(teamId, vaultId);
      showToast('Secret deleted from vault.');
    } catch (err) {
      alert(err.message || 'Failed to delete secret');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchVaultMessages(teamId, newPage, pagination.limit);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isTeamOwner = currentTeam && (
    String(currentTeam.createdBy?._id || currentTeam.createdBy) === String(user?._id || user?.id)
  );

  return (
    <div className="vault-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-bar" style={{ borderRadius: 'var(--radius-md)' }}>
        <Link to="/teams" className="breadcrumb-link">
          <ArrowLeft size={16} />
          <span>Back to Teams Dashboard</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{currentTeam?.name || 'Team Vault'}</span>
      </div>

      {/* Header Card */}
      <div className="vault-header-card">
        <div className="vault-title-area">
          <h1>
            <Lock size={22} />
            <span>{currentTeam?.name ? `${currentTeam.name} Vault` : 'Team Vault'}</span>
            <span className="vault-item-count">{pagination.total} items</span>
          </h1>
          <p className="vault-meta-info">
            Shared, role-governed secrets storage. Only team members have access to decrypt and view.
          </p>
        </div>

        <div>
          <button
            onClick={() => { setIsAddingSecret(!isAddingSecret); setFormError(''); }}
            className="btn-primary"
          >
            {isAddingSecret ? <X size={16} /> : <Plus size={16} />}
            <span>{isAddingSecret ? 'Close Form' : 'Add New Secret'}</span>
          </button>
        </div>
      </div>

      {/* Add Secret Collapsible Form */}
      {isAddingSecret && (
        <div className="add-secret-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Store a New Secret / Note</h3>
          {formError && (
            <div className="auth-error-alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAddSecretSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="secret-form-row">
              <div className="form-group">
                <label htmlFor="secret-title">Secret Title / Label</label>
                <input
                  id="secret-title"
                  type="text"
                  placeholder="e.g. AWS Production Read-Only Key"
                  value={secretForm.title}
                  onChange={(e) => setSecretForm({ ...secretForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="secret-category">Category</label>
                <select
                  id="secret-category"
                  value={secretForm.category}
                  onChange={(e) => setSecretForm({ ...secretForm, category: e.target.value })}
                >
                  <option value="Password">Password</option>
                  <option value="API_Key">API Key</option>
                  <option value="Note">Note</option>
                  <option value="File_Link">File Link</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="secret-content">Secret Content (Value / Credentials)</label>
              <textarea
                id="secret-content"
                rows="4"
                placeholder="Paste the API key, database URI, password, or sensitive credential here..."
                value={secretForm.content}
                onChange={(e) => setSecretForm({ ...secretForm, content: e.target.value })}
                required
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div className="secret-form-actions">
              <button
                type="button"
                onClick={() => setIsAddingSecret(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Saving Secret...' : 'Store Secret'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vault Items List */}
      <div className="vault-feed">
        {loading && messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading encrypted secrets...
          </div>
        ) : messages.length === 0 ? (
          <div className="vault-empty-state">
            <div className="vault-empty-icon">
              <Inbox size={48} strokeWidth={1.5} />
            </div>
            <h2>No Secrets Stored Yet</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
              This team vault is empty. Click "+ Add New Secret" above to securely share your first password, API key, or note with the team.
            </p>
          </div>
        ) : (
          messages.map((item) => {
            const isUnmasked = !!unmaskedMap[item._id];
            const authorId = item.author?._id || item.author;
            const authorName = item.author?.username || 'Team Member';
            const canDelete = isTeamOwner || String(authorId) === String(user?._id || user?.id);
            const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={item._id} className="vault-item-card">
                <div className="vault-item-top">
                  <div>
                    <div className="vault-item-title-row">
                      <span className="vault-item-title">{item.title || 'Untitled Secret'}</span>
                      <span className={`badge badge-category-${item.category || 'Note'}`}>
                        {getCategoryIcon(item.category)}
                        <span>{item.category ? item.category.replace('_', ' ') : 'Note'}</span>
                      </span>
                    </div>
                    <div className="vault-item-meta">
                      <span>Added by <strong>{authorName}</strong></span>
                      <span>•</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="vault-item-actions">
                    <button
                      onClick={() => copyToClipboard(item.content, item.title, item._id)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      title="Copy raw value"
                      aria-label="Copy secret value"
                    >
                      {copiedId === item._id ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                      <span>{copiedId === item._id ? 'Copied' : 'Copy'}</span>
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteSecret(item._id, item.title)}
                        className="btn-danger-outline"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center' }}
                        title="Delete Secret"
                        aria-label={`Delete secret ${item.title || ''}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Secret Value Display with Toggle */}
                <div className="secret-content-container">
                  <div className="secret-value-wrapper">
                    {isUnmasked ? (
                      <span className="secret-value-text">{item.content}</span>
                    ) : (
                      <span className="secret-value-masked">••••••••••••••••••••••••</span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleMask(item._id)}
                    className="secret-toggle-btn"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    aria-label={isUnmasked ? 'Hide secret value' : 'Show secret value'}
                  >
                    {isUnmasked ? (
                      <>
                        <EyeOff size={14} />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="pagination-bar">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            aria-label="Next page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamVault;
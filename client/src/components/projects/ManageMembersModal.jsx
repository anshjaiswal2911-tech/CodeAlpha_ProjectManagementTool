import React, { useState } from 'react';
import { X, UserPlus, Trash2, Shield, User, Loader2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { RoleBadge } from '../common/Badge';

export const ManageMembersModal = ({ isOpen, onClose, project }) => {
  const { addMember, removeMember, updateMemberRole } = useProject();
  const { user: currentUser } = useAuth();

  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !project) return null;

  const isOwner =
    project.owner?._id === currentUser?._id || project.owner === currentUser?._id;
  const currentMember = project.members?.find(
    (m) => (m.user?._id || m.user) === currentUser?._id
  );
  const isAdmin = isOwner || currentMember?.role === 'admin';

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await addMember(project._id, emailInput.trim(), roleInput);
      setSuccess(`Added member successfully!`);
      setEmailInput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError('');
      await updateMemberRole(project._id, userId, newRole);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }
    try {
      setError('');
      await removeMember(project._id, userId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Project Members</h2>
              <p className="text-xs text-slate-500">Manage team collaboration and permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
              {success}
            </div>
          )}

          {/* Add member form (Admins only) */}
          {isAdmin && (
            <form onSubmit={handleAddMember} className="space-y-3 pb-5 border-b border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Invite New Member
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Invite</span>
                </button>
              </div>
            </form>
          )}

          {/* Current Members List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Team Roster ({project.members?.length || 0})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {project.members?.map((member) => {
                const memberUser = member.user || {};
                const isMemberOwner =
                  (project.owner?._id || project.owner) === memberUser._id;
                const isSelf = memberUser._id === currentUser?._id;

                return (
                  <div
                    key={memberUser._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar user={memberUser} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {memberUser.name || 'Member'}
                          </p>
                          {isSelf && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{memberUser.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMemberOwner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                          <Shield className="w-3 h-3" />
                          Owner
                        </span>
                      ) : isAdmin && !isSelf ? (
                        <>
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(memberUser._id, e.target.value)}
                            className="text-xs py-1 px-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            onClick={() => handleRemove(memberUser._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;

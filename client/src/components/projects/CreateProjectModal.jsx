import React, { useState } from 'react';
import { X, Plus, Trash2, FolderPlus, Loader2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

const COLOR_PRESETS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Cyan', value: '#06b6d4' },
];

const CATEGORIES = [
  'Development',
  'Design',
  'Marketing',
  'Product',
  'Research',
  'Operations',
  'General',
];

export const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject } = useProject();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development',
    color: '#6366f1',
    dueDate: '',
  });

  const [memberEmailInput, setMemberEmailInput] = useState('');
  const [memberEmails, setMemberEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddEmail = (e) => {
    e?.preventDefault();
    const email = memberEmailInput.trim().toLowerCase();
    if (!email) return;

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (memberEmails.includes(email)) {
      setError('Email already added');
      return;
    }

    setMemberEmails([...memberEmails, email]);
    setMemberEmailInput('');
    setError('');
  };

  const handleRemoveEmail = (index) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createProject({
        ...formData,
        memberEmails,
        dueDate: formData.dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Create New Project</h2>
              <p className="text-xs text-slate-500">Organize tasks and collaborate with your team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Mobile Banking App Redesign"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What is this project about? Goals, deliverables, scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Color theme presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Team Member Invitations */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Invite Team Members (By Email)
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="colleague@example.com"
                value={memberEmailInput}
                onChange={(e) => setMemberEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {memberEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {memberEmails.map((email, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-lg"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(idx)}
                      className="text-brand-500 hover:text-brand-900 focus:outline-none"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;

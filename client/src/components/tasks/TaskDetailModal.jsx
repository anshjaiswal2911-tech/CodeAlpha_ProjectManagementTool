import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Trash2,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useProject } from '../../context/ProjectContext';
import Avatar from '../common/Avatar';
import TaskComments from './TaskComments';

export const TaskDetailModal = ({ isOpen, onClose, task, members = [] }) => {
  const { updateTask, deleteTask } = useProject();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignee: task.assignee?._id || task.assignee || '',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleStatusQuickChange = async (newStatus) => {
    try {
      setFormData((prev) => ({ ...prev, status: newStatus }));
      await updateTask(task._id, { status: newStatus });
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      setError('');
      await updateTask(task._id, {
        ...formData,
        assignee: formData.assignee || null,
        dueDate: formData.dueDate || null,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) {
      return;
    }
    try {
      await deleteTask(task._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Task Details
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Title and Edit Toggle */}
          <div className="space-y-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-lg sm:text-xl font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none transition-colors pb-1"
              placeholder="Task title"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a more detailed description..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => {
                  setFormData({ ...formData, status: e.target.value });
                  handleStatusQuickChange(e.target.value);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Assignee
              </label>
              <select
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => {
                  const u = m.user || {};
                  return (
                    <option key={u._id} value={u._id}>
                      {u.name || u.email}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="pt-4 border-t border-slate-200">
            <TaskComments taskId={task._id} projectId={task.project?._id || task.project} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;

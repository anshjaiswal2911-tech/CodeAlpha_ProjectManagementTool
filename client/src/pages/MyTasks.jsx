import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Search,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
];

export const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    completedCount: 0,
    inProgressCount: 0,
    todoCount: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks/my-tasks');
      if (res.data.success) {
        setTasks(res.data.tasks);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load my tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchMyTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchMyTasks();
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchesTitle = task.title?.toLowerCase().includes(q);
      const matchesDesc = task.description?.toLowerCase().includes(q);
      const matchesProject = task.project?.title?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesProject) return false;
    }
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <CheckSquare className="w-6 h-6 text-brand-600" />
          <span>My Assigned Tasks</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your deliverables, update your progress, and collaborate across projects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Assigned
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalAssigned}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overdue
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats.overdueCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search my tasks or projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs sm:text-sm py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="backlog">Backlog</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs sm:text-sm py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <LoadingSpinner message="Loading your assigned tasks..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No assigned tasks found"
          description="You have no tasks matching the selected filters. Explore your projects to pick up new work."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Task Title</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTasks.map((task) => {
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const isOverdue =
                    dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed';

                  return (
                    <tr
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-semibold text-slate-900 group-hover:text-brand-600">
                          {task.title}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <Link
                          to={`/projects/${task.project?._id || task.project}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: task.project?.color || '#6366f1' }}
                          />
                          <span>{task.project?.title || 'Project'}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="text-xs font-medium py-1 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-brand-500"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-4 px-4">
                        <PriorityBadge priority={task.priority} />
                      </td>

                      <td className="py-4 px-4">
                        {dueDate ? (
                          <div
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              isOverdue ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded' : 'text-slate-600'
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{format(dueDate, 'MMM d, yyyy')}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null);
            fetchMyTasks();
          }}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default MyTasks;

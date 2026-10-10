import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import api from '../api/axiosClient';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard = () => {
  const { user } = useAuth();
  const { projects, loading, fetchProjects } = useProject();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState('all');
  const [myUrgentTasks, setMyUrgentTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Fetch projects and my tasks
  useEffect(() => {
    fetchProjects();

    const fetchMyTasks = async () => {
      try {
        setTasksLoading(true);
        const res = await api.get('/tasks/my-tasks');
        if (res.data.success) {
          // Filter to incomplete tasks sorted by urgency
          const pending = res.data.tasks.filter((t) => t.status !== 'completed');
          setMyUrgentTasks(pending.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load my tasks preview:', err);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchMyTasks();
  }, [fetchProjects]);

  // Aggregate stats across all projects
  const totalProjects = projects.length;
  const totalTasks = projects.reduce((acc, p) => acc + (p.stats?.totalTasks || 0), 0);
  const completedTasks = projects.reduce((acc, p) => acc + (p.stats?.completedTasks || 0), 0);
  const inProgressTasks = projects.reduce((acc, p) => acc + (p.stats?.inProgressTasks || 0), 0);
  const overdueTasks = projects.reduce((acc, p) => acc + (p.stats?.overdueTasks || 0), 0);

  const filteredProjects = projects.filter((p) => {
    if (projectFilter === 'active') return p.status === 'active';
    if (projectFilter === 'completed') return p.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-white/15 backdrop-blur-md rounded-full text-indigo-100 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Workspace Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Team Member'}! 👋
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            You have <strong className="text-white font-semibold">{myUrgentTasks.length} pending task(s)</strong> assigned to you across{' '}
            <strong className="text-white font-semibold">{totalProjects} project(s)</strong>.
          </p>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 flex-shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Projects
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalProjects}</h3>
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Progress
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{inProgressTasks}</h3>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tasks Done
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{completedTasks}</h3>
          </div>
        </div>

        {/* Overdue / Attention */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overdue
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overdueTasks}</h3>
          </div>
        </div>
      </div>

      {/* Main Content: Projects Grid + Urgent Tasks preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects Column (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Your Projects</h2>
              <p className="text-xs sm:text-sm text-slate-500">Manage boards, workflows, and deliverables</p>
            </div>

            {/* Filter Tabs & New Project Trigger */}
            <div className="flex items-center gap-2.5">
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
                <button
                  onClick={() => setProjectFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    projectFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({projects.length})
                </button>
                <button
                  onClick={() => setProjectFilter('active')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    projectFilter === 'active'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setProjectFilter('completed')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    projectFilter === 'completed'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Done
                </button>
              </div>

              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </button>
            </div>
          </div>

          {/* Project List / Cards */}
          {loading ? (
            <LoadingSpinner message="Loading your projects..." />
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              title="No projects found"
              description="Get started by creating your first group project or accept an invitation."
              actionLabel="Create Project"
              onAction={() => setCreateModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: "My Assigned Tasks" Quick Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Assigned to You</h3>
            <Link
              to="/my-tasks"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
            {tasksLoading ? (
              <LoadingSpinner size="sm" message="Loading tasks..." />
            ) : myUrgentTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                🎉 No pending tasks assigned to you right now!
              </div>
            ) : (
              myUrgentTasks.map((task) => (
                <Link
                  key={task._id}
                  to={`/projects/${task.project?._id || task.project}`}
                  className="block p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-brand-200 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {task.project?.title || 'Project'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        task.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 group-hover:text-brand-600 line-clamp-1">
                    {task.title}
                  </p>

                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {createModalOpen && (
        <CreateProjectModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

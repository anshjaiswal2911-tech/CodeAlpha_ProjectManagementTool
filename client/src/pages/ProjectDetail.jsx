import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/board/KanbanBoard';
import TaskListView from '../components/board/TaskListView';
import TaskFilterBar from '../components/board/TaskFilterBar';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import ManageMembersModal from '../components/projects/ManageMembersModal';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Calendar,
  Users,
  Settings,
  Trash2,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { format } from 'date-fns';

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    activeProject,
    tasks,
    loading,
    error,
    fetchProjectDetails,
    updateTaskStatus,
    deleteTask,
    deleteProject,
  } = useProject();

  // Modals and UI state
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createTaskInitialStatus, setCreateTaskInitialStatus] = useState('todo');
  const [selectedTask, setSelectedTask] = useState(null);
  const [manageMembersModalOpen, setManageMembersModalOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  // Fetch project details on mount or ID change
  useEffect(() => {
    if (id) {
      fetchProjectDetails(id).catch((err) => {
        console.error('Error fetching project:', err);
      });
    }
  }, [id, fetchProjectDetails]);

  // Keep selectedTask in sync when tasks update
  useEffect(() => {
    if (selectedTask) {
      const refreshed = tasks.find((t) => t._id === selectedTask._id);
      if (refreshed) {
        setSelectedTask(refreshed);
      }
    }
  }, [tasks]);

  const isOwner =
    activeProject?.owner?._id === currentUser?._id ||
    activeProject?.owner === currentUser?._id;

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Status filter
      if (statusFilter && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter && task.priority !== priorityFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter) {
        if (assigneeFilter === 'unassigned') {
          if (task.assignee) return false;
        } else {
          const assigneeId = task.assignee?._id || task.assignee;
          if (assigneeId !== assigneeFilter) return false;
        }
      }

      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter]);

  const handleAddTaskInColumn = (columnStatus) => {
    setCreateTaskInitialStatus(columnStatus);
    setCreateTaskModalOpen(true);
  };

  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${activeProject.title}"? This will permanently delete all tasks and comments.`
      )
    ) {
      return;
    }
    try {
      await deleteProject(activeProject._id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading && !activeProject) {
    return <LoadingSpinner fullScreen message="Loading project workspace..." />;
  }

  if (error && !activeProject) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-white rounded-2xl border border-rose-200 shadow-sm mt-10">
        <h3 className="text-lg font-bold text-rose-700 mb-2">Error Loading Project</h3>
        <p className="text-sm text-slate-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!activeProject) return null;

  // Calculate project statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const dueDate = activeProject.dueDate ? new Date(activeProject.dueDate) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        {isOwner && (
          <button
            onClick={handleDeleteProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Project</span>
          </button>
        )}
      </div>

      {/* Project Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Title and metadata */}
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeProject.color || '#3b82f6' }}
              />
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {activeProject.category || 'General'}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full capitalize bg-brand-50 text-brand-700">
                {activeProject.status || 'active'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeProject.title}
            </h1>

            {activeProject.description && (
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                {activeProject.description}
              </p>
            )}
          </div>

          {/* Members & Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
            {/* Member avatars */}
            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-2.5 overflow-hidden">
                {activeProject.members?.map((member, idx) => (
                  <Avatar
                    key={member.user?._id || idx}
                    user={member.user}
                    size="sm"
                    className="border-2 border-white"
                  />
                ))}
              </div>

              <button
                onClick={() => setManageMembersModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Team ({activeProject.members?.length || 0})</span>
              </button>
            </div>

            {/* Target deadline */}
            {dueDate && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Deadline: {format(dueDate, 'MMMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar Footer */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>
              Sprint Progress ({completedTasks} of {totalTasks} tasks completed)
            </span>
            <span className="text-slate-900 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: activeProject.color || '#6366f1',
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Filters & View Toggle Bar */}
      <TaskFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        members={activeProject.members || []}
        onAddTask={() => {
          setCreateTaskInitialStatus('todo');
          setCreateTaskModalOpen(true);
        }}
      />

      {/* Main Board or List View */}
      {viewMode === 'board' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskClick={(task) => setSelectedTask(task)}
          onStatusChange={updateTaskStatus}
          onAddTask={handleAddTaskInColumn}
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          onTaskClick={(task) => setSelectedTask(task)}
          onStatusChange={updateTaskStatus}
          onDeleteTask={deleteTask}
        />
      )}

      {/* Modals */}
      {createTaskModalOpen && (
        <CreateTaskModal
          isOpen={createTaskModalOpen}
          onClose={() => setCreateTaskModalOpen(false)}
          projectId={activeProject._id}
          initialStatus={createTaskInitialStatus}
          members={activeProject.members || []}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          members={activeProject.members || []}
        />
      )}

      {manageMembersModalOpen && (
        <ManageMembersModal
          isOpen={manageMembersModalOpen}
          onClose={() => setManageMembersModalOpen(false)}
          project={activeProject}
        />
      )}
    </div>
  );
};

export default ProjectDetail;

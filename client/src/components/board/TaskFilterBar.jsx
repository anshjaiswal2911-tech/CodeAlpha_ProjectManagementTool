import React from 'react';
import { Search, Filter, Kanban, List, Plus, X } from 'lucide-react';

export const TaskFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  viewMode,
  onViewModeChange,
  members = [],
  onAddTask,
}) => {
  const hasActiveFilters = search || statusFilter || priorityFilter || assigneeFilter;

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('');
    onPriorityFilterChange('');
    onAssigneeFilterChange('');
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="text-xs sm:text-sm py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="backlog">Backlog</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="completed">Completed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          className="text-xs sm:text-sm py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Assignee Filter */}
        <select
          value={assigneeFilter}
          onChange={(e) => onAssigneeFilterChange(e.target.value)}
          className="text-xs sm:text-sm py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {members.map((m) => {
            const u = m.user || {};
            return (
              <option key={u._id} value={u._id}>
                {u.name || u.email}
              </option>
            );
          })}
        </select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* View Switcher & Add Task Button */}
      <div className="flex items-center gap-3 self-end lg:self-auto">
        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => onViewModeChange('board')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'board'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Kanban Board View"
          >
            <Kanban className="w-4 h-4" />
            <span className="hidden sm:inline">Board</span>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
};

export default TaskFilterBar;

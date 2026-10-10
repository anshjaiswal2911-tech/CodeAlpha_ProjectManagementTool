import React from 'react';
import { Calendar, MessageSquare, Trash2, ArrowUpRight } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Avatar from '../common/Avatar';
import { PriorityBadge, StatusBadge } from '../common/Badge';

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
];

export const TaskListView = ({
  tasks = [],
  onTaskClick,
  onStatusChange,
  onDeleteTask,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-semibold text-slate-700">No tasks found</p>
        <p className="text-xs text-slate-400 mt-1">Try changing your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Task</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Assignee</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {tasks.map((task) => {
              const dueDate = task.dueDate ? new Date(task.dueDate) : null;
              const isOverdue =
                dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed';

              return (
                <tr
                  key={task._id}
                  onClick={() => onTaskClick?.(task)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Title & Description */}
                  <td className="py-4 px-4 sm:px-6 max-w-xs sm:max-w-md">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange?.(task._id, e.target.value)}
                      className="text-xs font-medium py-1 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-brand-500 transition-colors"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-4">
                    <PriorityBadge priority={task.priority} />
                  </td>

                  {/* Assignee */}
                  <td className="py-4 px-4">
                    {task.assignee ? (
                      <Avatar user={task.assignee} size="xs" showName />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="py-4 px-4">
                    {dueDate ? (
                      <div
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          isOverdue
                            ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md'
                            : 'text-slate-600'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(dueDate, 'MMM d, yyyy')}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onTaskClick?.(task)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View Task Details"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      {onDeleteTask && (
                        <button
                          onClick={() => onDeleteTask(task._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskListView;

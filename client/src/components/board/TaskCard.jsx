import React, { useState } from 'react';
import { Calendar, MessageSquare, MoreVertical, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Avatar from '../common/Avatar';
import { PriorityBadge } from '../common/Badge';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'completed', label: 'Completed' },
];

export const TaskCard = ({ task, onClick, onStatusChange, onDragStart }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue =
    dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task._id);
    onDragStart?.(task._id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick?.(task)}
      className="group relative bg-white p-4 rounded-xl border border-slate-200/80 hover:border-brand-400 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer select-none space-y-3"
    >
      {/* Top Header: Priority Badge & Move Dropdown */}
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} size="xs" />

        {/* Quick status change menu */}
        <div
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Move Task Status"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Move to:
              </p>
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  disabled={col.id === task.status}
                  onClick={() => {
                    onStatusChange?.(task._id, col.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    col.id === task.status
                      ? 'text-brand-600 font-semibold bg-brand-50/50'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{col.label}</span>
                  {col.id === task.status && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Description Snippet if available */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: Due Date, Comments indicator, Assignee Avatar */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {/* Due date */}
          {dueDate && (
            <div
              className={`flex items-center gap-1 font-medium text-[11px] ${
                isOverdue
                  ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded'
                  : 'text-slate-500'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{format(dueDate, 'MMM d')}</span>
            </div>
          )}

          {/* Comment Count / Discussion */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600">
            <MessageSquare className="w-3 h-3" />
            <span>Comments</span>
          </div>
        </div>

        {/* Assignee Avatar */}
        <div>
          {task.assignee ? (
            <Avatar user={task.assignee} size="xs" />
          ) : (
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
              Unassigned
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

export const KanbanColumn = ({
  column,
  tasks = [],
  onTaskClick,
  onStatusChange,
  onAddTask,
  onDropTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask?.(taskId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-80 flex-shrink-0 bg-slate-100/70 rounded-2xl border border-slate-200/60 p-3.5 transition-all duration-200 ${
        isDragOver ? 'bg-indigo-50/70 border-brand-400 ring-2 ring-brand-300' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 py-1 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            {column.title}
          </h3>
          <span className="flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full shadow-xs">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask?.(column.id)}
          className="p-1 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-colors"
          title={`Add task to ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List Stack */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/40">
            <p className="text-xs text-slate-400 font-medium">No tasks</p>
            <button
              onClick={() => onAddTask?.(column.id)}
              className="mt-1 text-xs text-brand-600 hover:underline font-medium"
            >
              + Create task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={onTaskClick}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;

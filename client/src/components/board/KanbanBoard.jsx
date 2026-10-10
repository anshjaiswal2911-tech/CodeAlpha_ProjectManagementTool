import React from 'react';
import KanbanColumn from './KanbanColumn';

export const BOARD_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#64748b' },
  { id: 'todo', title: 'To Do', color: '#6366f1' },
  { id: 'in_progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'in_review', title: 'In Review', color: '#a855f7' },
  { id: 'completed', title: 'Completed', color: '#10b981' },
];

export const KanbanBoard = ({
  tasks = [],
  onTaskClick,
  onStatusChange,
  onAddTask,
}) => {
  const handleDropTask = (taskId, targetStatus) => {
    onStatusChange?.(taskId, targetStatus);
  };

  return (
    <div className="flex gap-5 overflow-x-auto pb-6 pt-1 items-start min-h-[500px]">
      {BOARD_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        return (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={columnTasks}
            onTaskClick={onTaskClick}
            onStatusChange={onStatusChange}
            onAddTask={onAddTask}
            onDropTask={handleDropTask}
          />
        );
      })}
    </div>
  );
};

export default KanbanBoard;

import React from 'react';
import { FolderKanban, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderKanban,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-slate-300 rounded-xl shadow-sm ${className}`}
    >
      <div className="w-12 h-12 mb-4 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

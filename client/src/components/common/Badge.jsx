import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

export const PriorityBadge = ({ priority = 'medium', size = 'sm' }) => {
  const configs = {
    urgent: {
      label: 'Urgent',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      icon: AlertCircle,
    },
    high: {
      label: 'High',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
    },
    medium: {
      label: 'Medium',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      icon: Clock,
    },
    low: {
      label: 'Low',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      icon: HelpCircle,
    },
  };

  const config = configs[priority.toLowerCase()] || configs.medium;
  const Icon = config.icon;

  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${config.bg} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const StatusBadge = ({ status = 'todo', size = 'sm' }) => {
  const configs = {
    backlog: {
      label: 'Backlog',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    todo: {
      label: 'To Do',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    in_review: {
      label: 'In Review',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  };

  const config = configs[status.toLowerCase()] || configs.todo;
  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${config.bg} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
};

export const RoleBadge = ({ role = 'member' }) => {
  const configs = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    member: 'bg-blue-100 text-blue-800 border-blue-200',
    viewer: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border uppercase tracking-wider ${
        configs[role.toLowerCase()] || configs.member
      }`}
    >
      {role}
    </span>
  );
};

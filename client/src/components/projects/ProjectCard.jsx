import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Avatar from '../common/Avatar';

export const ProjectCard = ({ project }) => {
  const stats = project.stats || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
    progressPercentage: 0,
  };

  const dueDate = project.dueDate ? new Date(project.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && stats.progressPercentage < 100;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Top Color Accent */}
      <div
        className="h-2 w-full transition-colors"
        style={{ backgroundColor: project.color || '#3b82f6' }}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header: Category & Status */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {project.category || 'General'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${
                project.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700'
                  : project.status === 'archived'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-brand-50 text-brand-700'
              }`}
            >
              {project.status || 'active'}
            </span>
          </div>

          {/* Title & Description */}
          <Link
            to={`/projects/${project._id}`}
            className="block group-hover:text-brand-600 transition-colors"
          >
            <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1">
              {project.title}
            </h3>
          </Link>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {project.description || 'No description provided for this project.'}
          </p>
        </div>

        {/* Middle: Progress Bar */}
        <div className="my-5">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600">Progress</span>
            <span className="text-slate-900">{stats.progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.progressPercentage}%`,
                backgroundColor: project.color || '#6366f1',
              }}
            />
          </div>
        </div>

        {/* Footer: Due date, Member avatars, and Link */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {/* Members list */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {project.members?.slice(0, 4).map((member, idx) => (
              <Avatar
                key={member.user?._id || idx}
                user={member.user}
                size="xs"
                className="border-2 border-white"
              />
            ))}
            {project.members?.length > 4 && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 border-2 border-white text-[10px] font-bold text-slate-600">
                +{project.members.length - 4}
              </div>
            )}
          </div>

          {/* Due date or Overdue indicator */}
          {dueDate ? (
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                isOverdue ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(dueDate, 'MMM d')}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">No deadline</span>
          )}

          {/* Action Link */}
          <Link
            to={`/projects/${project._id}`}
            className="p-1.5 rounded-lg text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

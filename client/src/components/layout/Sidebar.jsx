import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  FolderKanban,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, onOpenCreateProject }) => {
  const { projects } = useProject();
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Tasks',
      path: '/my-tasks',
      icon: CheckSquare,
    },
    {
      name: 'Team Directory',
      path: '/team',
      icon: Users,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between h-16 px-6 lg:hidden border-b border-slate-800">
          <span className="text-base font-bold text-white">Navigation</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
          <div>
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Main Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Projects List */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Projects ({projects.length})
              </span>
              <button
                onClick={() => {
                  onClose?.();
                  onOpenCreateProject?.();
                }}
                className="p-1 text-slate-400 hover:text-brand-400 rounded hover:bg-slate-800 transition-colors"
                title="Create New Project"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {projects.length === 0 ? (
                <div className="px-3 py-4 text-center rounded-xl bg-slate-800/40 border border-slate-800">
                  <p className="text-xs text-slate-400">No projects yet</p>
                  <button
                    onClick={() => {
                      onClose?.();
                      onOpenCreateProject?.();
                    }}
                    className="mt-2 text-xs font-medium text-brand-400 hover:underline"
                  >
                    + Create one now
                  </button>
                </div>
              ) : (
                projects.map((project) => {
                  const isActive = location.pathname === `/projects/${project._id}`;
                  return (
                    <NavLink
                      key={project._id}
                      to={`/projects/${project._id}`}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all group ${
                        isActive
                          ? 'bg-slate-800 text-white font-medium border-l-4 border-brand-500'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color || '#3b82f6' }}
                        />
                        <span className="truncate text-xs sm:text-sm">{project.title}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform ${
                          isActive ? 'rotate-90 text-brand-400' : ''
                        }`}
                      />
                    </NavLink>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="text-[11px] text-slate-400 text-center">
            CodeAlpha Internship • Task 3
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

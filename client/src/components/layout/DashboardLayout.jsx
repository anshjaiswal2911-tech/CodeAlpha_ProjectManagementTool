import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CreateProjectModal from '../projects/CreateProjectModal';
import { useProject } from '../../context/ProjectContext';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const { fetchProjects } = useProject();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenCreateProject={() => setCreateProjectModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {createProjectModalOpen && (
        <CreateProjectModal
          isOpen={createProjectModalOpen}
          onClose={() => setCreateProjectModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;

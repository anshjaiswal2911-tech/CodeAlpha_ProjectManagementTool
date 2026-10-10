import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProjectProvider } from './context/ProjectContext';

// Auth Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';
import TeamMembers from './pages/TeamMembers';
import NotFound from './pages/NotFound';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ProjectProvider>
            <Routes>
              {/* Public Guest Routes */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />

              {/* Protected App Routes inside Dashboard Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="my-tasks" element={<MyTasks />} />
                <Route path="team" element={<TeamMembers />} />
              </Route>

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProjectProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

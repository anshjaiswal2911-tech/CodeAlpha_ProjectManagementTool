import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosClient';
import { useSocket } from './SocketContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { socket } = useSocket();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state for boards and list view
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignee: '',
  });

  // Fetch list of user's projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single project details & tasks
  const fetchProjectDetails = useCallback(async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/projects/${projectId}`);
      if (res.data.success) {
        setActiveProject(res.data.project);
        setTasks(res.data.tasks);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create project
  const createProject = async (projectData) => {
    const res = await api.post('/projects', projectData);
    if (res.data.success) {
      setProjects((prev) => [res.data.project, ...prev]);
    }
    return res.data;
  };

  // Update project
  const updateProject = async (projectId, updateData) => {
    const res = await api.put(`/projects/${projectId}`, updateData);
    if (res.data.success) {
      setActiveProject(res.data.project);
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, ...res.data.project } : p))
      );
    }
    return res.data;
  };

  // Delete project
  const deleteProject = async (projectId) => {
    const res = await api.delete(`/projects/${projectId}`);
    if (res.data.success) {
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      if (activeProject?._id === projectId) {
        setActiveProject(null);
        setTasks([]);
      }
    }
    return res.data;
  };

  // Add member
  const addMember = async (projectId, email, role = 'member') => {
    const res = await api.post(`/projects/${projectId}/members`, { email, role });
    if (res.data.success) {
      setActiveProject(res.data.project);
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? res.data.project : p))
      );
    }
    return res.data;
  };

  // Remove member
  const removeMember = async (projectId, userId) => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    if (res.data.success) {
      setActiveProject(res.data.project);
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? res.data.project : p))
      );
    }
    return res.data;
  };

  // Update member role
  const updateMemberRole = async (projectId, userId, role) => {
    const res = await api.patch(`/projects/${projectId}/members/${userId}`, { role });
    if (res.data.success) {
      setActiveProject(res.data.project);
    }
    return res.data;
  };

  // Create Task
  const createTask = async (projectId, taskData) => {
    const res = await api.post(`/projects/${projectId}/tasks`, taskData);
    if (res.data.success) {
      // Avoid duplicate if socket broadcast also received
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === res.data.task._id);
        return exists ? prev : [res.data.task, ...prev];
      });
    }
    return res.data;
  };

  // Update Task details
  const updateTask = async (taskId, taskData) => {
    const res = await api.put(`/tasks/${taskId}`, taskData);
    if (res.data.success) {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data.task : t))
      );
    }
    return res.data;
  };

  // Update Task status (Kanban column move)
  const updateTaskStatus = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? res.data.task : t))
        );
      }
      return res.data;
    } catch (err) {
      // Revert if failed
      if (activeProject) {
        fetchProjectDetails(activeProject._id);
      }
      throw err;
    }
  };

  // Delete Task
  const deleteTask = async (taskId) => {
    const res = await api.delete(`/tasks/${taskId}`);
    if (res.data.success) {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    }
    return res.data;
  };

  // Real-time socket event handling for active project
  useEffect(() => {
    if (!socket || !activeProject) return;

    socket.emit('join:project', activeProject._id);

    const handleTaskCreated = (newTask) => {
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === newTask._id);
        return exists ? prev : [newTask, ...prev];
      });
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    };

    const handleTaskStatusChanged = ({ taskId, status, task }) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? (task || { ...t, status }) : t))
      );
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:status_changed', handleTaskStatusChanged);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.emit('leave:project', activeProject._id);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:status_changed', handleTaskStatusChanged);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket, activeProject]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        tasks,
        loading,
        error,
        filters,
        setFilters,
        fetchProjects,
        fetchProjectDetails,
        createProject,
        updateProject,
        deleteProject,
        addMember,
        removeMember,
        updateMemberRole,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

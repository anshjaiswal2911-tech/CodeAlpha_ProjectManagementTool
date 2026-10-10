const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

// Helper to check user membership in project
const isProjectMember = (project, userId) => {
  if (project.owner.toString() === userId.toString()) return true;
  return project.members.some(
    (m) => m.user.toString() === userId.toString() || (m.user._id && m.user._id.toString() === userId.toString())
  );
};

// @desc    Get all tasks for a specific project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view tasks in this project',
      });
    }

    const { status, priority, assignee, search } = req.query;
    const query = { project: projectId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) {
      query.assignee = assignee === 'unassigned' ? null : assignee;
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar jobTitle')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task in a project
// @route   POST /api/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assignee, dueDate, tags } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create tasks in this project',
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    // Verify assignee is a member if provided
    let verifiedAssignee = null;
    if (assignee) {
      const isAssigneeMember = isProjectMember(project, assignee);
      if (!isAssigneeMember) {
        return res.status(400).json({
          success: false,
          message: 'The selected assignee is not a member of this project',
        });
      }
      verifiedAssignee = assignee;
    }

    const taskCount = await Task.countDocuments({ project: projectId, status: status || 'todo' });

    const task = await Task.create({
      title,
      description: description || '',
      project: projectId,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: verifiedAssignee,
      reporter: req.user._id,
      dueDate: dueDate || null,
      order: taskCount,
      tags: Array.isArray(tags) ? tags : [],
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar jobTitle')
      .populate('project', 'title color');

    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: 'created_task',
      targetType: 'task',
      targetId: task._id,
      details: `created task "${title}"`,
    });

    // Emit socket event if io is attached
    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('task:created', populatedTask);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task detail with comments
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar jobTitle')
      .populate({
        path: 'project',
        select: 'title description owner members color dueDate status',
        populate: [
          { path: 'owner', select: 'name email avatar jobTitle' },
          { path: 'members.user', select: 'name email avatar jobTitle' },
        ],
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (!isProjectMember(task.project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this task',
      });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('author', 'name email avatar jobTitle')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      task,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (!isProjectMember(task.project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this task',
      });
    }

    const { title, description, status, priority, assignee, dueDate, tags } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) task.tags = Array.isArray(tags) ? tags : [];

    if (assignee !== undefined) {
      if (assignee === null || assignee === '' || assignee === 'unassigned') {
        task.assignee = null;
      } else {
        const isMember = isProjectMember(task.project, assignee);
        if (!isMember) {
          return res.status(400).json({
            success: false,
            message: 'Selected assignee is not a member of the project',
          });
        }
        task.assignee = assignee;
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar jobTitle')
      .populate('project', 'title color');

    await Activity.create({
      project: task.project._id,
      user: req.user._id,
      action: 'updated_task',
      targetType: 'task',
      targetId: task._id,
      details: `updated task "${task.title}"`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project._id}`).emit('task:updated', updatedTask);
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (e.g. Kanban column change)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;
    const validStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (!isProjectMember(task.project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this task',
      });
    }

    const oldStatus = task.status;
    task.status = status;
    if (typeof order === 'number') {
      task.order = order;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar jobTitle')
      .populate('project', 'title color');

    await Activity.create({
      project: task.project._id,
      user: req.user._id,
      action: 'updated_status',
      targetType: 'task',
      targetId: task._id,
      details: `moved "${task.title}" from ${oldStatus} to ${status}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project._id}`).emit('task:status_changed', {
        taskId: task._id,
        status,
        task: updatedTask,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (!isProjectMember(task.project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this task',
      });
    }

    const projectId = task.project._id;
    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(task._id);

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('task:deleted', { taskId: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks assigned to the current user across all projects
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const query = { assignee: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('project', 'title color status dueDate')
      .populate('reporter', 'name email avatar jobTitle')
      .populate('assignee', 'name email avatar jobTitle')
      .sort({ dueDate: 1, createdAt: -1 });

    const totalAssigned = tasks.length;
    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
    const todoCount = tasks.filter((t) => t.status === 'todo' || t.status === 'backlog').length;
    const now = new Date();
    const overdueCount = tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
      stats: {
        totalAssigned,
        completedCount,
        inProgressCount,
        todoCount,
        overdueCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMyTasks,
};

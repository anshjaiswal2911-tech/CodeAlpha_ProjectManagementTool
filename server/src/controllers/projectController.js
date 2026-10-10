const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Helper to check user membership in project
const isProjectMember = (project, userId) => {
  if (project.owner.toString() === userId.toString()) return true;
  return project.members.some(
    (m) => m.user.toString() === userId.toString() || (m.user._id && m.user._id.toString() === userId.toString())
  );
};

// Helper to check if user has admin/owner rights in project
const isProjectAdmin = (project, userId) => {
  if (project.owner.toString() === userId.toString() || (project.owner._id && project.owner._id.toString() === userId.toString())) {
    return true;
  }
  const member = project.members.find(
    (m) => m.user.toString() === userId.toString() || (m.user._id && m.user._id.toString() === userId.toString())
  );
  return member && member.role === 'admin';
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find projects where user is owner OR member
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar jobTitle')
      .populate('members.user', 'name email avatar jobTitle')
      .sort({ updatedAt: -1 });

    // Attach task count stats for each project
    const projectListWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
        const todoTasks = tasks.filter((t) => t.status === 'todo').length;
        const now = new Date();
        const overdueTasks = tasks.filter(
          (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now
        ).length;

        const projectObj = project.toObject();
        projectObj.stats = {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
          progressPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
        return projectObj;
      })
    );

    res.status(200).json({
      success: true,
      count: projectListWithStats.length,
      projects: projectListWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { title, description, category, color, dueDate, memberEmails } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required',
      });
    }

    const members = [
      {
        user: req.user._id,
        role: 'admin',
        joinedAt: new Date(),
      },
    ];

    // Optionally invite members by email during project creation
    if (Array.isArray(memberEmails) && memberEmails.length > 0) {
      for (const email of memberEmails) {
        if (!email) continue;
        const foundUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (foundUser && foundUser._id.toString() !== req.user._id.toString()) {
          members.push({
            user: foundUser._id,
            role: 'member',
            joinedAt: new Date(),
          });
        }
      }
    }

    const project = await Project.create({
      title,
      description: description || '',
      owner: req.user._id,
      members,
      category: category || 'Development',
      color: color || '#3b82f6',
      dueDate: dueDate || null,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar jobTitle')
      .populate('members.user', 'name email avatar jobTitle');

    // Create activity record
    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'created_project',
      targetType: 'project',
      targetId: project._id,
      details: `created project "${title}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar jobTitle')
      .populate('members.user', 'name email avatar jobTitle');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check authorization
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this project',
      });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar jobTitle')
      .sort({ order: 1, createdAt: -1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const stats = {
      totalTasks,
      completedTasks,
      progressPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };

    res.status(200).json({
      success: true,
      project,
      tasks,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Owner/Admin)
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners or administrators can edit project settings',
      });
    }

    const { title, description, category, color, dueDate, status } = req.body;

    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (category) project.category = category;
    if (color) project.color = color;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (status) project.status = status;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar jobTitle')
      .populate('members.user', 'name email avatar jobTitle');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner only)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can delete this project',
      });
    }

    // Cascade delete project tasks, comments, activities
    const taskIds = (await Task.find({ project: project._id })).map((t) => t._id);
    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      success: true,
      message: 'Project and all related tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or invite a member to project
// @route   POST /api/projects/:id/members
// @access  Private (Owner/Admin)
const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners and admins can add team members',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'User email is required',
      });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: `No user account found with email "${email}". Please ensure the user has registered.`,
      });
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a member of the project',
      });
    }

    project.members.push({
      user: userToAdd._id,
      role: role || 'member',
      joinedAt: new Date(),
    });

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar jobTitle')
      .populate('members.user', 'name email avatar jobTitle');

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'added_member',
      targetType: 'member',
      targetId: userToAdd._id,
      details: `added ${userToAdd.name} to the project as ${role || 'member'}`,
    });

    res.status(200).json({
      success: true,
      message: `${userToAdd.name} added to the project`,
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Owner/Admin)
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners and admins can remove members',
      });
    }

    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'The project owner cannot be removed from the project',
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== userId
    );

    await project.save();

    // Unassign tasks assigned to removed member in this project
    await Task.updateMany(
      { project: project._id, assignee: userId },
      { $set: { assignee: null } }
    );

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar jobTitle')
      .populate('members.user', 'name email avatar jobTitle');

    res.status(200).json({
      success: true,
      message: 'Member removed from project successfully',
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member role in project
// @route   PATCH /api/projects/:id/members/:userId
// @access  Private (Owner/Admin)
const updateMemberRole = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners and admins can change member roles',
      });
    }

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be admin, member, or viewer',
      });
    }

    const member = project.members.find((m) => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in project',
      });
    }

    member.role = role;
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar jobTitle')
      .populate('members.user', 'name email avatar jobTitle');

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
};

const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// Helper to check user membership in project
const isProjectMember = (project, userId) => {
  if (project.owner.toString() === userId.toString()) return true;
  return project.members.some(
    (m) => m.user.toString() === userId.toString() || (m.user._id && m.user._id.toString() === userId.toString())
  );
};

// @desc    Get all comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
const getTaskComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (!isProjectMember(task.project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view comments on this task',
      });
    }

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatar jobTitle')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new comment on a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty',
      });
    }

    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (!isProjectMember(task.project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task',
      });
    }

    const comment = await Comment.create({
      task: taskId,
      author: req.user._id,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name email avatar jobTitle'
    );

    await Activity.create({
      project: task.project._id,
      user: req.user._id,
      action: 'added_comment',
      targetType: 'comment',
      targetId: comment._id,
      details: `commented on task "${task.title}"`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${task.project._id}`).emit('comment:added', {
        taskId,
        comment: populatedComment,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Author or Project Admin)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    const task = await Task.findById(comment.task).populate('project');
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isOwner = task && task.project && task.project.owner.toString() === req.user._id.toString();

    if (!isAuthor && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }

    const taskId = comment.task;
    const projectId = task ? task.project._id : null;

    await Comment.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io && projectId) {
      io.to(`project:${projectId}`).emit('comment:deleted', {
        taskId,
        commentId: req.params.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTaskComments,
  createComment,
  deleteComment,
};

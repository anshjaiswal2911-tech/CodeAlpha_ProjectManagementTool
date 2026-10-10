const express = require('express');
const router = express.Router();
const {
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMyTasks,
} = require('../controllers/taskController');
const {
  getTaskComments,
  createComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/my-tasks', getMyTasks);

router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

router.patch('/:id/status', updateTaskStatus);

// Comments on task
router.route('/:taskId/comments').get(getTaskComments).post(createComment);

module.exports = router;

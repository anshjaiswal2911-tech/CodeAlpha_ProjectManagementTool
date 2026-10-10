const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} = require('../controllers/projectController');
const {
  getProjectTasks,
  createTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getProjects).post(createProject);

router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);

// Project member management
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.patch('/:id/members/:userId', updateMemberRole);

// Project tasks nested routes
router.route('/:projectId/tasks').get(getProjectTasks).post(createTask);

module.exports = router;

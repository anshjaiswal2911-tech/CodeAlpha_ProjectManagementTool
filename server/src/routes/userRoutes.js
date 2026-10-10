const express = require('express');
const router = express.Router();
const { searchUsers, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/search', searchUsers);
router.get('/', getAllUsers);

module.exports = router;

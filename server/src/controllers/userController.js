const User = require('../models/User');

// @desc    Search users by name or email
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user from search
        {
          $or: [{ name: regex }, { email: regex }],
        },
      ],
    })
      .select('name email avatar jobTitle')
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (directory)
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email avatar jobTitle bio createdAt');
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchUsers,
  getAllUsers,
};

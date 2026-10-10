const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Comment must be associated with a task'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must have an author'],
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      minlength: [1, 'Comment must have at least 1 character'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', commentSchema);

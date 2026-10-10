const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
      index: true,
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'in_review', 'completed'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for task comments
taskSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'task',
});

module.exports = mongoose.model('Task', taskSchema);

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['project', 'task', 'comment', 'member'],
      default: 'task',
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);

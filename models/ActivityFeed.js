const mongoose = require('mongoose');

const activityFeedSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  task: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'task_created',
      'task_completed',
      'task_reopened',
      'task_deleted',
      'project_created',
      'project_deleted',
      'project_updated'
    ],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient querying
activityFeedSchema.index({ user: 1, createdAt: -1 });
activityFeedSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityFeed', activityFeedSchema);
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Project title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    enum: ['bg-green-100', 'bg-yellow-100', 'bg-red-100', 'bg-blue-100', 'bg-purple-100', 'bg-pink-100'],
    default: 'bg-blue-100'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'editor'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  tasksCount: {
    type: Number,
    default: 0
  },
  completedTasksCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate progress percentage
projectSchema.virtual('progress').get(function() {
  if (this.tasksCount === 0) return 0;
  return Math.round((this.completedTasksCount / this.tasksCount) * 100);
});

// Ensure virtual fields are included in JSON output
projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
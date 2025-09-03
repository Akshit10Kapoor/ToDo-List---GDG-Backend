const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityFeed = require('../models/ActivityFeed');
const { authenticateToken } = require('../middleware/Auth');

const router = express.Router();

// Get all user projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ 
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
});

// Get single project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, color, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required'
      });
    }

    const project = new Project({
      title,
      description,
      color,
      priority,
      dueDate,
      owner: req.user._id
    });

    await project.save();
    await project.populate('owner', 'name email');

    // Create activity feed entry
    const activity = new ActivityFeed({
      user: req.user._id,
      projectId: project._id,
      projectName: project.title,
      task: project.title,
      type: 'project_created'
    });
    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, color, priority, dueDate, status } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can update
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to update'
      });
    }

    // Update fields
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (color !== undefined) project.color = color;
    if (priority !== undefined) project.priority = priority;
    if (dueDate !== undefined) project.dueDate = dueDate;
    if (status !== undefined) project.status = status;

    await project.save();
    await project.populate('owner', 'name email');

    // Create activity feed entry
    const activity = new ActivityFeed({
      user: req.user._id,
      projectId: project._id,
      projectName: project.title,
      task: project.title,
      type: 'project_updated'
    });
    await activity.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can delete
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete'
      });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: project._id });

    // Create activity feed entry before deletion
    const activity = new ActivityFeed({
      user: req.user._id,
      projectId: project._id,
      projectName: project.title,
      task: project.title,
      type: 'project_deleted'
    });
    await activity.save();

    // Delete project
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
});

// Add collaborator to project
router.post('/:id/collaborators', authenticateToken, async (req, res) => {
  try {
    const { userEmail, role = 'editor' } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can add collaborators
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission'
      });
    }

    // Find user by email
    const User = require('../models/User');
    const collaboratorUser = await User.findOne({ email: userEmail });
    if (!collaboratorUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(
      collab => collab.user.toString() === collaboratorUser._id.toString()
    );

    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        message: 'User is already a collaborator'
      });
    }

    // Add collaborator
    project.collaborators.push({
      user: collaboratorUser._id,
      role
    });

    await project.save();
    await project.populate('collaborators.user', 'name email');

    res.json({
      success: true,
      message: 'Collaborator added successfully',
      project
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add collaborator',
      error: error.message
    });
  }
});

// Remove collaborator from project
router.delete('/:id/collaborators/:userId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can remove collaborators
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission'
      });
    }

    // Remove collaborator
    project.collaborators = project.collaborators.filter(
      collab => collab.user.toString() !== req.params.userId
    );

    await project.save();
    await project.populate('collaborators.user', 'name email');

    res.json({
      success: true,
      message: 'Collaborator removed successfully',
      project
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove collaborator',
      error: error.message
    });
  }
});

// Get project statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get task statistics
    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalTasks: project.tasksCount,
      completedTasks: project.completedTasksCount,
      inProgressTasks: project.tasksCount - project.completedTasksCount,
      progress: project.progress,
      tasksByStatus: taskStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: error.message
    });
  }
});

module.exports = router;
const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityFeed = require('../models/ActivityFeed');
const { authenticateToken } = require('../middleware/Auth');

const router = express.Router();

// Update project task counts
const updateProjectTaskCounts = async (projectId) => {
  const totalTasks = await Task.countDocuments({ project: projectId });
  const completedTasks = await Task.countDocuments({ 
    project: projectId, 
    completed: true 
  });

  await Project.findByIdAndUpdate(projectId, {
    tasksCount: totalTasks,
    completedTasksCount: completedTasks
  });
};

// Get all tasks for a project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    // Check if user has access to this project
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access'
      });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// Get single task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title owner collaborators')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task's project
const hasAccess = task.project.owner.toString() === req.user._id.toString();


    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this task'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
});

// Create new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      projectId, 
      assignedTo, 
      priority, 
      dueDate, 
      tags 
    } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Task title and project ID are required'
      });
    }

const project = await Project.findOne({
  _id: projectId,
  owner: req.user._id
});


    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access'
      });
    }

    // Get next order number
    const lastTask = await Task.findOne({ project: projectId })
      .sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = new Task({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
      priority,
      dueDate,
      tags,
      order
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    // Update project task counts
    await updateProjectTaskCounts(projectId);

    // Create activity feed entry
    const activity = new ActivityFeed({
      user: req.user._id,
      projectId: projectId,
      projectName: project.title,
      taskId: task._id,
      task: task.title,
      type: 'task_created'
    });
    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      status, 
      priority, 
      dueDate, 
      tags, 
      assignedTo 
    } = req.body;

    const task = await Task.findById(req.params.id)
      .populate('project', 'title owner collaborators');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task's project
const hasAccess = task.project.owner.toString() === req.user._id.toString();


    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this task'
      });
    }

    const oldStatus = task.status;
    const oldCompleted = task.completed;

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags !== undefined) task.tags = tags;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    // Update project task counts
    await updateProjectTaskCounts(task.project._id);

    // Create activity feed entries for status changes
    if (oldCompleted !== task.completed) {
      const activityType = task.completed ? 'task_completed' : 'task_reopened';
      const activity = new ActivityFeed({
        user: req.user._id,
        projectId: task.project._id,
        projectName: task.project.title,
        taskId: task._id,
        task: task.title,
        type: activityType
      });
      await activity.save();
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title owner collaborators');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task's project
const hasAccess = task.project.owner.toString() === req.user._id.toString();


    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this task'
      });
    }

    const projectId = task.project._id;
    const projectTitle = task.project.title;
    const taskTitle = task.title;

    // Delete task
    await Task.findByIdAndDelete(req.params.id);

    // Update project task counts
    await updateProjectTaskCounts(projectId);

    // Create activity feed entry
    const activity = new ActivityFeed({
      user: req.user._id,
      projectId: projectId,
      projectName: projectTitle,
      task: taskTitle,
      type: 'task_deleted'
    });
    await activity.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// Toggle task completion
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title owner collaborators');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task's project
const hasAccess = task.project.owner.toString() === req.user._id.toString();


    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this task'
      });
    }

    // Toggle completion
    task.completed = !task.completed;
    task.status = task.completed ? 'completed' : 'todo';
    if (task.completed) {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    // Update project task counts
    await updateProjectTaskCounts(task.project._id);

    // Create activity feed entry
    const activityType = task.completed ? 'task_completed' : 'task_reopened';
    const activity = new ActivityFeed({
      user: req.user._id,
      projectId: task.project._id,
      projectName: task.project.title,
      taskId: task._id,
      task: task.title,
      type: activityType
    });
    await activity.save();

    res.json({
      success: true,
      message: `Task ${task.completed ? 'completed' : 'reopened'} successfully`,
      task
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle task completion',
      error: error.message
    });
  }
});

// Reorder tasks
router.patch('/reorder', authenticateToken, async (req, res) => {
  try {
    const { taskIds, projectId } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs array and project ID are required'
      });
    }

    // Check if user has access to this project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access'
      });
    }

    // Update order for each task
    const updatePromises = taskIds.map((taskId, index) => 
      Task.findByIdAndUpdate(taskId, { order: index })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder tasks',
      error: error.message
    });
  }
});

// Get user's activity feed
router.get('/activity/feed', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const activities = await ActivityFeed.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.json({
      success: true,
      activities,
      pagination: {
        currentPage: page,
        limit,
        totalItems: await ActivityFeed.countDocuments({ user: req.user._id })
      }
    });
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity feed',
      error: error.message
    });
  }
});

module.exports = router;
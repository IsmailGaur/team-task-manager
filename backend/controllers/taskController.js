const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create task
// @route   POST /api/tasks
// @access  Admin only
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // If assigning to someone, verify they're in the project
    if (assignedTo) {
      const isMember = project.teamMembers.some(m => m.toString() === assignedTo);
      const isAdmin = project.createdBy.toString() === assignedTo;
      if (!isMember && !isAdmin) {
        return res.status(400).json({ success: false, message: 'Assigned user is not a member of this project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'title');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks by project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Members can only see tasks from their projects
    if (req.user.role === 'Member') {
      const isMember = project.teamMembers.some(m => m.toString() === req.user._id.toString());
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks (Admin)
// @route   GET /api/tasks
// @access  Admin only
const getAllTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (Member: own tasks only; Admin: any)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update their own tasks
    if (req.user.role === 'Member') {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only update tasks assigned to you' });
      }
    }

    task.status = req.body.status;
    await task.save();

    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'title');

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update full task (Admin only)
// @route   PUT /api/tasks/:id
// @access  Admin only
const updateTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, status, priority, dueDate },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin only
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasksByProject, getMyTasks, getAllTasks, updateTaskStatus, updateTask, deleteTask };

const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create project
// @route   POST /api/projects
// @access  Admin only
const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, teamMembers } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      teamMembers: teamMembers || [],
    });

    await project.populate('createdBy', 'name email');
    await project.populate('teamMembers', 'name email role');

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects (Admin: all, Member: assigned only)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'Admin') {
      query = Project.find();
    } else {
      // Members only see projects they're part of
      query = Project.find({ teamMembers: req.user._id });
    }

    const projects = await query
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Members can only view their own projects
    if (req.user.role === 'Member' && !project.teamMembers.some(m => m._id.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin only
const updateProject = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('teamMembers', 'name email role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin only
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ projectId: req.params.id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and associated tasks deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Admin only
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.teamMembers.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already in project' });
    }

    project.teamMembers.push(userId);
    await project.save();
    await project.populate('teamMembers', 'name email role');

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Admin only
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.teamMembers = project.teamMembers.filter(
      m => m.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('teamMembers', 'name email role');

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember };

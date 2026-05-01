const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    let taskFilter = {};
    let projectFilter = {};

    // Members see only their own tasks/projects
    if (req.user.role === 'Member') {
      taskFilter.assignedTo = req.user._id;
      projectFilter.teamMembers = req.user._id;
    }

    const [totalTasks, completedTasks, inProgressTasks, overdueTasks, totalProjects, recentTasks] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'Done' }),
      Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
      Task.countDocuments({ ...taskFilter, status: { $ne: 'Done' }, dueDate: { $lt: now } }),
      Project.countDocuments(projectFilter),
      Task.find(taskFilter)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title')
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    // Task status breakdown for chart
    const todoTasks = await Task.countDocuments({ ...taskFilter, status: 'Todo' });

    let memberCount = null;
    if (req.user.role === 'Admin') {
      memberCount = await User.countDocuments({ role: 'Member' });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
          pendingTasks: totalTasks - completedTasks,
          totalProjects,
          memberCount,
        },
        recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };

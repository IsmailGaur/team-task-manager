const express = require('express');
const router = express.Router();
const {
  createTask, getTasksByProject, getMyTasks,
  getAllTasks, updateTaskStatus, updateTask, deleteTask
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const { createTaskValidators, updateStatusValidators } = require('../validators/taskValidators');

router.use(protect);

// My tasks (for current user)
router.get('/my', getMyTasks);

// All tasks (Admin only)
router.get('/', authorize('Admin'), getAllTasks);

// Create task (Admin only)
router.post('/', authorize('Admin'), createTaskValidators, createTask);

// Tasks by project
router.get('/project/:projectId', getTasksByProject);

// Update task status (any authenticated user for their tasks)
router.patch('/:id/status', updateStatusValidators, updateTaskStatus);

// Full update + delete (Admin only)
router.put('/:id', authorize('Admin'), updateTask);
router.delete('/:id', authorize('Admin'), deleteTask);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { createProjectValidators } = require('../validators/taskValidators');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('Admin'), createProjectValidators, createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('Admin'), updateProject)
  .delete(authorize('Admin'), deleteProject);

router.post('/:id/members', authorize('Admin'), addMember);
router.delete('/:id/members/:userId', authorize('Admin'), removeMember);

module.exports = router;

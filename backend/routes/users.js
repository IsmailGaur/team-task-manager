const express = require('express');
const router = express.Router();
const { getUsers, getUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('Admin'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { signupValidators, loginValidators } = require('../validators/authValidators');

router.post('/signup', signupValidators, signup);
router.post('/login', loginValidators, login);
router.get('/me', protect, getMe);

module.exports = router;

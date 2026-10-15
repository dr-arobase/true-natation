const express = require('express');
const router = express.Router();
const { login, register, getMe, changePassword, updateAvatar } = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', auth, getMe);
router.put('/change-password', auth, changePassword);
router.put('/avatar', auth, updateAvatar);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getUsers, getUserStats, updateUser, deleteUser } = require('../controllers/userController');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { userSchema } = require('../validations/schemas');

router.use(auth);

// Advanced Route: Get User Stats for Graphs
router.get('/stats', rbac(['Admin', 'Analyst']), getUserStats);

// Admin-only User routes
router.use(rbac(['Admin']));
router.get('/', getUsers);
router.put('/:id', validate(userSchema), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

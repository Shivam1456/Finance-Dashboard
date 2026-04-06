const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');

router.use(auth);

// All roles can see the dashboard summary
router.get('/summary', rbac(['Admin', 'Analyst', 'Viewer']), getDashboardSummary);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getRecords, getRecord, createRecord, updateRecord, deleteRecord, restoreRecord } = require('../controllers/recordController');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { recordSchema, updateRecordSchema } = require('../validations/schemas');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

// All roles can read records
router.get('/', rbac(['Admin', 'Analyst', 'Viewer']), getRecords);
router.get('/:id', rbac(['Admin', 'Analyst', 'Viewer']), getRecord);

// Only Admin can create, modify, delete records
router.post('/upload', rbac(['Admin']), upload.single('file'), require('../controllers/recordController').uploadCSVRecords);
router.post('/', rbac(['Admin']), validate(recordSchema), createRecord);
router.put('/:id', rbac(['Admin']), validate(updateRecordSchema), updateRecord);
router.delete('/:id', rbac(['Admin']), deleteRecord);
router.put('/:id/restore', rbac(['Admin']), restoreRecord);

module.exports = router;

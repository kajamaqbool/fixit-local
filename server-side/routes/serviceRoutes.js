const express = require('express');
const { createService, searchServices, getServiceById } = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

router.get('/', searchServices);
router.get('/:id', getServiceById);
router.post('/', protect, restrictTo('provider'), createService);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getApplications,
  getApplicationById,
  reviewApplication,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', submitApplication);
router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.patch('/:id', reviewApplication);

module.exports = router;

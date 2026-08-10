const express = require('express');
const router = express.Router();
const { listUsers, listPosts, deletePost, listApplications } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/users', listUsers);
router.get('/posts', listPosts);
router.delete('/posts/:id', deletePost);
router.get('/applications', listApplications);

module.exports = router;

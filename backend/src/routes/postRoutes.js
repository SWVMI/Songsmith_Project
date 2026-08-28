const express = require('express');
const router = express.Router();
const { getPosts, getPostById, createPost, updatePost, deletePost, closePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); 

router.get('/', getPosts);
router.post('/', createPost);
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.patch('/:id/close', closePost);
router.delete('/:id', deletePost);

module.exports = router;

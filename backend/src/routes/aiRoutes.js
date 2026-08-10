const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  sendMessage,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);
router.post('/conversations/:id/messages', sendMessage);

module.exports = router;

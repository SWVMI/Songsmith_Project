const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversationById,
  sendMessage,
  updateConversationStatus,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getConversations);
router.get('/:id', getConversationById);
router.post('/:id/messages', sendMessage);
router.patch('/:id/status', updateConversationStatus);

module.exports = router;

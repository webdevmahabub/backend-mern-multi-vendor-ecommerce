const router = require('express').Router()
const ChatController = require('../controllers/chat/ChatController')
const { authMiddleware } = require('../middlewares/authMiddleware')

router.post('/chat/customer/add-customer-friend', ChatController.add_customer_friend)
router.post('/chat/customer/send-message', ChatController.customer_message_add)

module.exports = router
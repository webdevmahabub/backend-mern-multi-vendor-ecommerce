const authControllers = require('../controllers/authControllers')
const router = require('express').Router()
const { authMiddleware } = require('../middlewares/authMiddleware')

router.post('/admin-login',authControllers.admin_login)
router.get('/get-user',authMiddleware, authControllers.getUser)
module.exports = router
const authControllers = require('../controllers/authControllers')
const router = require('express').Router()
const { authMiddleware } = require('../middlewares/authMiddleware')

router.post('/admin-login',authControllers.admin_login)
router.get('/get-user',authMiddleware, authControllers.getUser)
router.post('/seller-register',authControllers.seller_register)
router.post('/seller-login',authControllers.seller_login)

module.exports = router
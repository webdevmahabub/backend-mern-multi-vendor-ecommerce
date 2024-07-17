const categoryController = require('../../controllers/dashboard/categoryController') 
const { authMiddleware } = require('../../middlewares/authMiddleware')
const router = require('express').Router()

router.get('/category-get',authMiddleware, categoryController.get_category)
router.post('/category-add',authMiddleware, categoryController.add_category) 

module.exports = router
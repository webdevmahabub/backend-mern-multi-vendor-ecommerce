const productController = require('../../controllers/dashboard/productController') 
const { authMiddleware } = require('../../middlewares/authMiddleware')
const router = require('express').Router()

router.post('/product-add',authMiddleware, productController.add_product)  
router.get('/products-get',authMiddleware, productController.products_get)  

module.exports = router
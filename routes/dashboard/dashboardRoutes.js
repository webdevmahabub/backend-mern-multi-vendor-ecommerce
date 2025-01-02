// router.get('/admin/get-dashboard-data',authMiddleware, dashboardController.get_admin_dashboard_data)  
// router.get('/seller/get-dashboard-data',authMiddleware, dashboardController.get_seller_dashboard_data) 
 
const router = require('express').Router()
const dashboardController = require('../../controllers/dashboard/dashboardController') 
const { authMiddleware } = require('../../middlewares/authMiddleware')

router.post('/banner/add', authMiddleware, dashboardController.add_banner)  
router.get('/banner/get/:productId', authMiddleware, dashboardController.get_banner)  
router.put('/banner/update/:bannerId',authMiddleware, dashboardController.update_banner)  
module.exports = router
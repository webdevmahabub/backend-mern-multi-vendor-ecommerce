const orderController = require('../../controllers/order/orderController')
const router = require('express').Router()
// Customer
router.post('/home/order/place-order',orderController.place_order) 
router.get('/home/customer/get-dashboard-data/:userId',orderController.get_customer_dashboard_data)
router.get('/home/customer/get-orders/:customerId/:status',orderController.get_orders)
router.get('/home/customer/get-order-details/:orderId',orderController.get_order_details)
// Admin
router.get('/admin/orders',orderController.get_admin_orders)
// Seller  
module.exports = router 
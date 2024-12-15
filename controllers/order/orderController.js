const authOrderModel = require('../../models/authOrder')
const customerOrder = require('../../models/customerOrder')
const cardModel = require('../../models/cardModel')
const moment = require("moment")
const { responseReturn } = require('../../utils/response') 
const { mongo: {ObjectId}} = require('mongoose')

class orderController{

    paymentCheck = async (id) => {
        try {
            const order = await customerOrder.findById(id)
            if (order.payment_status === 'unpaid') {
                await customerOrder.findByIdAndUpdate(id, {
                    delivery_status: 'cancelled'
                })
                await authOrderModel.updateMany({
                    orderId: id
                },{
                    delivery_status: 'cancelled'
                })
            }
            return true
        } catch (error) {
            console.log(error)
        }
    }
    // end method 

    place_order = async (req,res) => {
        const {price,products,shipping_fee,shippingInfo,userId } = req.body
        let authorOrderData = []
        let cardId = []
        const tempDate = moment(Date.now()).format('LLL')
        let customerOrderProduct = []
        for (let i = 0; i < products.length; i++) {
            const pro = products[i].products
            for (let j = 0; j < pro.length; j++) {
                const tempCusPro = pro[j].productInfo;
                tempCusPro.quantity = pro[j].quantity
                customerOrderProduct.push(tempCusPro)
                if (pro[j]._id) {
                    cardId.push(pro[j]._id)
                } 
            } 
        }
        try {
            const order = await customerOrder.create({
                customerId: userId,
                shippingInfo,
                customerId: userId,shippingInfo,
                products: customerOrderProduct,
                price: price + shipping_fee,
                payment_status: 'unpaid',
                delivery_status: 'pending',
                date: tempDate
            })
            for (let i = 0; i < products.length; i++) {
                const pro = products[i].products
                const pri = products[i].price
                const sellerId = products[i].sellerId
                let storePor = []
                for (let j = 0; j < pro.length; j++) {
                    const tempPro = pro[j].productInfo
                    tempPro.quantity = pro[j].quantity
                    storePor.push(tempPro)                    
                }
                authorOrderData.push({
                    orderId: order.id,sellerId,
                    products: storePor,
                    price:pri,
                    payment_status: 'unpaid',
                    shippingInfo: 'Green Main Warehouse',
                    delivery_status: 'pending',
                    date: tempDate
                }) 
            }
            await authOrderModel.insertMany(authorOrderData)
            for (let k = 0; k < cardId.length; k++) {
                await cardModel.findByIdAndDelete(cardId[k]) 
            }
            setTimeout(() => {
                this.paymentCheck(order.id)
            }, 15000)
            responseReturn(res,200,{message: "Order Placed Success" , orderId: order.id })
        } catch (error) {
            const order = await customerOrder.create({
                customerId: userId,shippingInfo,
                products: customerOrderProduct,
                price: price + shipping_fee,
                payment_status: 'pending',
                delivery_status: 'unpaid',
                date: tempDate
            })
            for (let i = 0; i < products.length; i++) {
                const pro = products[i].products;
                const pri = products[i].price
                const sellerId = products[i].sellerId
                let storePor = []
                for (let j = 0; j < pro.length; j++) {
                    const tempPro = pro[j].productInfo;
                    tempPro.quantity = pro[j].quantity
                    storePor.push(tempPro)                    
                }
                authorOrderData.push({
                    orderId: order.id,sellerId,
                    products: storePor,
                    price:pri,
                    payment_status: 'unpaid',
                    shippingInfo: 'Green Main Warehouse',
                    delivery_status: 'pending',
                    date: tempDate
                }) 
            }
            await authOrderModel.insertMany(authorOrderData)
            for (let k = 0; k < cardId.length; k++) {
                await cardModel.findByIdAndDelete(cardId[k]) 
            }
            responseReturn(res,200,{message: "Order Placed Success" , orderId: order.id })
        }
 
    }
    // End Method 

    get_customer_dashboard_data = async(req,res) => {
        const{ userId } = req.params 
        try {
            const recentOrders = await customerOrder.find({
                customerId: new ObjectId(userId) 
            }).limit(5)
            const pendingOrder = await customerOrder.find({
                customerId: new ObjectId(userId),delivery_status: 'pending'
             }).countDocuments()
             const totalOrder = await customerOrder.find({
                customerId: new ObjectId(userId)
             }).countDocuments()
             const cancelledOrder = await customerOrder.find({
                customerId: new ObjectId(userId),delivery_status: 'cancelled'
             }).countDocuments()
             responseReturn(res, 200,{
                recentOrders,
                pendingOrder,
                totalOrder,
                cancelledOrder
             })
            
        } catch (error) {
            console.log(error.message)
        } 
    }
     // End Method 

     get_orders = async (req, res) => {
        const {customerId, status} = req.params
        try {
            let orders = []
            if (status !== 'all') {
                orders = await customerOrder.find({
                    customerId: new ObjectId(customerId),
                    delivery_status: status
                })
            } else {
                orders = await customerOrder.find({
                    customerId: new ObjectId(customerId)
                })
            }
            responseReturn(res, 200,{
                orders
            })
            
        } catch (error) {
            console.log(error.message)
        }
     }
 // End Method 

 get_order_details = async (req, res) => {
    const {orderId} = req.params
    try {
        const order = await customerOrder.findById(orderId)
        responseReturn(res,200, {
            order
        })
        
    } catch (error) {
        console.log(error.message)
    }
 }
 // End Method
 
 get_admin_orders = async(req, res) => {
    let {page,searchValue,parPage} = req.query
    page = parseInt(page)
    parPage= parseInt(parPage)
    const skipPage = parPage * (page - 1)
    try {
        if (searchValue) {
            
        } else {
            const orders = await customerOrder.aggregate([
                {
                    $lookup: {
                        from: 'authororders',
                        localField: "_id",
                        foreignField: 'orderId',
                        as: 'suborder'
                    }
                }
            ]).skip(skipPage).limit(parPage).sort({ createdAt: -1})
            const totalOrder = await customerOrder.aggregate([
                {
                    $lookup: {
                        from: 'authororders',
                        localField: "_id",
                        foreignField: 'orderId',
                        as: 'suborder'
                    }
                }
            ])
            responseReturn(res,200, { orders, totalOrder: totalOrder.length })
        }
    } catch (error) {
        console.log(error.message)
    } 
 }
  // End Method 

  get_admin_order = async (req, res) => {
    const { orderId } = req.params
    try {
        const order = await customerOrder.aggregate([
            {
                $match: {_id: new ObjectId(orderId)}
            },
            {
                $lookup: {
                    from: 'authororders',
                    localField: "_id",
                    foreignField: 'orderId',
                    as: 'suborder'
                }
            }
        ])
        responseReturn(res,200, { order: order[0] })
    } catch (error) {
        console.log('get admin order details' + error.message)
    }
  }
  // End Method

  admin_order_status_update = async(req, res) => {
    const { orderId } = req.params
    const { status } = req.body
    try {
        await customerOrder.findByIdAndUpdate(orderId, {
            delivery_status : status
        })
        responseReturn(res,200, {message: 'order Status change success'})
    } catch (error) {
        console.log('get admin status error' + error.message)
        responseReturn(res,500, {message: 'internal server error'})
    }
     
  }
  // End Method 

  get_seller_orders = async (req,res) => {
    const {sellerId} = req.params
    let {page,searchValue,parPage} = req.query
    page = parseInt(page)
    parPage= parseInt(parPage)
    const skipPage = parPage * (page - 1)
    try {
        if (searchValue) {
            
        } else {
            const orders = await authOrderModel.find({
                sellerId,
            }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
            const totalOrder = await authOrderModel.find({
                sellerId
            }).countDocuments()
            responseReturn(res,200, {orders,totalOrder})
        }
        
    } catch (error) {
     console.log('get seller Order error' + error.message)
     responseReturn(res,500, {message: 'internal server error'})
    }
}
// End Method 

get_seller_order = async (req,res) => {
    const { orderId } = req.params
    
    try {
        const order = await authOrderModel.findById(orderId)
        responseReturn(res, 200, { order })
    } catch (error) {
        console.log('get seller details error' + error.message)
    }
  }
  // End Method 

  seller_order_status_update = async(req,res) => {
    const {orderId} = req.params
    const { status } = req.body
    try {
        await authOrderModel.findByIdAndUpdate(orderId,{
            delivery_status: status
        })
        responseReturn(res,200, {message: 'order status updated successfully'})
    } catch (error) {
        console.log('get seller Order error' + error.message)
        responseReturn(res,500, {message: 'internal server error'})
    }
  }
  // End Method 
}
module.exports = new orderController()
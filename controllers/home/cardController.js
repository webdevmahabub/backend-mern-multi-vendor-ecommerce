const cardModel = require('../../models/cardModel')
const { responseReturn } = require('../../utils/response')
const { mongo: {ObjectId}} = require('mongoose')

class cardController{
   
    add_to_card =  async(req, res) => {
        const { userId, productId, quantity } = req.body
        try {
            const product = await cardModel.findOne({
                $and: [{
                    productId : {
                        $eq: productId
                    }
                },
                {
                    userId: {
                        $eq: userId
                    }
                }
            ]
            })
            if (product) {
                responseReturn(res,404,{error: "Product Already Added To Card" })
            } else {
                const product = await cardModel.create({
                    userId,
                    productId,
                    quantity
                })
                responseReturn(res,201,{message: "Added To Card Successfully" , product})
            }
            
        } catch (error) {
            console.log(error.message)
        }
    }
    // End Method 

    get_card_products = async(req, res) => {
        const co = 5;
        const {userId } = req.params
        try {
         const card_products = await cardModel.aggregate([{
             $match: {
                 userId: {
                     $eq: new ObjectId(userId)
                 }
             }
            },
            {
                $lookup : {
                    from: 'products',
                    localField: 'productId',
                    foreignField: "_id",
                    as: 'products'
                }
            } 
          ])
          let buy_product_item = 0
          let calculatePrice = 0;
          let card_product_count = 0;
          const outOfStockProduct = card_products.filter(p => p.products[0].stock < p.quantity)
          for (let i = 0; i < outOfStockProduct.length; i++) {
             card_product_count = card_product_count + outOfStockProduct[i].quantity        
          }
          const stockProduct = card_products.filter(p => p.products[0].stock >= p.quantity)
          for (let i = 0; i < stockProduct.length; i++) {
            const { quantity } = stockProduct[i]
            card_product_count = buy_product_item + quantity
            buy_product_item = buy_product_item + quantity
            const { price,discount } = stockProduct[i].products[0]
            if (discount !== 0) {
                calculatePrice = calculatePrice + quantity * (price - Math.floor((price * discount) / 100 ))
            } else {
                calculatePrice  = calculatePrice + quantity * price
            }        
          } // end for
          let p = [] 
          let unique = [...new Set(stockProduct.map(p => p.products[0].sellerId.toString()))] 
      for (let i = 0; i < unique.length; i++) {
        let price = 0;
        for (let j = 0; j < stockProduct.length; j++) {
           const tempProduct = stockProduct[j].products[0]
           if (unique[i] === tempProduct.sellerId.toString()) {
                let pri = 0;
                if (tempProduct.discount !== 0) {
                    pri = tempProduct.price - Math.floor((tempProduct.price * tempProduct.discount) / 100 )
                } else {
                    pri = tempProduct.price
                }
        pri = pri - Math.floor((pri * co) / 100)
        price = price + pri * stockProduct[j].quantity
        p[i] = {
            sellerId: unique[i], 
            shopName: tempProduct.shopName,
            price,
            products: p[i] ? [
                ...p[i].products,
                {
                    _id: stockProduct[j]._id,
                    quantity: stockProduct[j].quantity,
                    productInfo: tempProduct 
                }
            ] : [{
                _id: stockProduct[j]._id,
                quantity: stockProduct[j].quantity,
                productInfo: tempProduct 
            }]
          } 
           } 
        } 
      }
      responseReturn(res,200,{ 
        card_products: p,
        price: calculatePrice,
        card_product_count,
        shipping_fee: 20 * p.length,
        outOfStockProduct,
        buy_product_item
      })
        } catch (error) {
          console.log(error.message)
        }
        
     }
     // End Method 
}
module.exports = new cardController()
const sellerModel = require('../../models/sellerModel')
const customerModel = require('../../models/customerModel')
const sellerCustomerModel = require('../../models/chat/sellerCustomerModel')
const sellerCustomerMessage = require('../../models/chat/sellerCustomerMessage')

class ChatController {
    add_customer_friend = async (req, res) => {
        const { sellerId, userId } = req.body
        try {
            if (!sellerId || !userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Seller ID and User ID are required'
                })
            }

            const seller = await sellerModel.findById(sellerId)
            if (!seller) {
                return res.status(404).json({
                    success: false,
                    message: 'Seller not found'
                })
            }

            const user = await customerModel.findById(userId)
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                })
            }

            let customerFriends = await sellerCustomerModel.findOne({ myId: userId })
            
            // If no document exists for this customer, create one
            if (!customerFriends) {
                customerFriends = await sellerCustomerModel.create({
                    myId: userId,
                    myFriends: []
                })
            }

            // Check if seller is already a friend
            const isAlreadyFriend = customerFriends.myFriends.some(friend => 
                friend.fdId.toString() === sellerId
            )

            if (!isAlreadyFriend) {
                await sellerCustomerModel.updateOne(
                    { myId: userId },
                    {
                        $push: {
                            myFriends: {
                                fdId: sellerId,
                                name: seller.shopInfo?.shopName,
                                image: seller.image
                            }
                        }
                    }
                )
            }

            // Get updated friends list
            const updatedCustomerFriends = await sellerCustomerModel.findOne({ myId: userId })

            return res.status(200).json({
                success: true,
                message: 'Friend added successfully',
                friends: updatedCustomerFriends.myFriends
            })

        } catch (error) {
            console.error('add_customer_friend error:', error)
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            })
        }
    }

    customer_message_add = async (req, res) => {
        try {
            // Debug log the incoming request body
            console.log('Received request body:', req.body)
            
            const { userId, text, sellerId, name } = req.body

            // Validate all required fields
            if (!userId || !text || !sellerId || !name) {
                console.log('Missing required fields:', { userId, text, sellerId, name })
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                })
            }

            // Create the message with correct field names
            const messageData = {
                senderId: userId,
                senderName: name,
                receverId: sellerId,  // Note: using receverId to match your schema
                message: text
            }

            console.log('Creating message with data:', messageData)

            const message = await sellerCustomerMessage.create(messageData)

            // Rest of your friend list update logic...
            const data = await sellerCustomerModel.findOne({ myId: userId })
            if (data) {
                let myFriends = [...data.myFriends]
                const index = myFriends.findIndex(f => f.fdId.toString() === sellerId)
                
                if (index > 0) {
                    const [friend] = myFriends.splice(index, 1)
                    myFriends.unshift(friend)
                    await sellerCustomerModel.updateOne(
                        { myId: userId },
                        { myFriends }
                    )
                }
            }

            return res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                data: message
            })

        } catch (error) {
            console.error('Message sending error:', error)
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}

module.exports = new ChatController()
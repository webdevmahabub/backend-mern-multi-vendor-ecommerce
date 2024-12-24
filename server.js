const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { dbConnect } = require('./utils/db')
const socket = require('socket.io')
const http = require('http')
const cors = require('cors');
const server = http.createServer(app)
app.use(cors({
    origin: ['http://localhost:3000','http://localhost:3001'], // Allow requests from frontend & backend
    credentials: true,              // Allow cookies and headers
}));
 
const io = socket(server, {
    cors: {
        origin: ['http://localhost:3000','http://localhost:3001'],
        methods: ['GET', 'POST'],    // Specify allowed HTTP methods
        credentials: true,
    },
});
var allCustomer = []
const addUser = (customerId,socketId,userInfo) => {
    const checkUser = allCustomer.some(u => u.customerId === customerId)
    if (!checkUser) {
        allCustomer.push({
            customerId,
            socketId,
            userInfo
        })
    }
} 
io.on('connection', (soc) => {
    console.log('socket server running..')
    soc.on('add_user',(customerId,userInfo)=>{
         addUser(customerId,soc.id,userInfo)
    })
})
require('dotenv').config()
app.use(bodyParser.json())
app.use(cookieParser())
app.use('/api/home',require('./routes/home/homeRoutes'))
app.use('/api',require('./routes/authRoutes'))
app.use('/api',require('./routes/order/orderRoutes'))
app.use('/api',require('./routes/home/cardRoutes'))
app.use('/api',require('./routes/dashboard/categoryRoutes'))
app.use('/api',require('./routes/dashboard/productRoutes'))
app.use('/api',require('./routes/dashboard/sellerRoutes'))
app.use('/api',require('./routes/home/customerAuthRoutes'))
app.use('/api',require('./routes/chatRoutes'))

app.get('/',(req,res) => res.send('Hello Ecommerce'))
const port = process.env.PORT
dbConnect()
server.listen(port, () => console.log(`Server is running on port ${port}`))
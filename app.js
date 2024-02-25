require('dotenv').config();
require('express-async-errors')

const express = require('express')
const app = express()
const port = process.env.PORT || 5000

const fileUpload = require('express-fileupload')
// USE V2
const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})



//others
const morgan = require('morgan')

app.use(morgan('tiny'))
app.use(express.json())
app.use(fileUpload({ useTempFiles: true }))

//routes
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const staffRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');


const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');


app.use('/api/v1', authRoutes)
app.use('/api/v1', orderRoutes)
app.use('/api/v1', productRoutes)
app.use('/api/v1/admin', staffRoutes)
app.use('/api/v1/user', userRoutes)


app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)


const start = async () => {
    try {
        app.listen(port, () => {
            console.log(`Server listening on port ${port}!`)
        })
    } catch (error) {
        throw new Error(error)
    }
}

start()
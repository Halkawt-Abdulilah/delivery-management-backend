require('dotenv').config();
require('express-async-errors')
const express = require('express')
const app = express()

const cors = require('cors');
const morgan = require('morgan');
const xss = require('xss-clean');
const winston = require('winston');
const rateLimiter = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const port = process.env.PORT || 5000

const fileUpload = require('express-fileupload')

const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'activity.log' })
    ]
});


app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 100,
    })
);
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(morgan('tiny'))
app.use(express.json())
app.use(fileUpload({ useTempFiles: true }))
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

//routes
const authRoutes = require('./routes/authRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require('./routes/orderRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const staffRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');


const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');


app.use((req, res, next) => {
    const message = {
        timestamp: Date.now(),
        method: req.method,
        url: req.url,
        // userAgent: req.headers['user-agent'],
        ip: req.ip,
    };
    logger.info(message);
    next();
});

app.use('/api/v1', authRoutes)
app.use('/api/v1', uploadRoutes)
app.use('/api/v1', orderRoutes)
app.use('/api/v1', productRoutes)
app.use('/api/v1', categoryRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/user', cartRoutes)
app.use('/api/v1/admin', staffRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)


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
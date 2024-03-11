const express = require('express')
const router = express.Router()

const { authenticateUser, authorizePermissions } = require('../middlewares/authentication')
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController')



router.get('/cart', authenticateUser, authorizePermissions("CUSTOMER"), getCart)
router.post('/cart/add', authenticateUser, authorizePermissions("CUSTOMER"), addToCart)
router.patch('/cart/remove', authenticateUser, authorizePermissions("CUSTOMER"), removeFromCart)

module.exports = router
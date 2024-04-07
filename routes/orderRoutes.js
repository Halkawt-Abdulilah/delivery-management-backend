const express = require('express')
const router = express.Router()

const { authenticateUser, authorizePermissions } = require('../middlewares/authentication')
const { getOwnUserOrders, getOwnDriverOrders, getOwnVendorOrders, acceptOrder, rejectOrder, deliverOrder, finalizeOrderDelivery, delayOrderDeliveryTime, getAllOrders, getSingleOrder, getAvailableOrders, createOrderNew } = require('../controllers/orderController')


router.get('/orders/:id', authenticateUser, authorizePermissions('ADMIN', 'VENDOR', 'DRIVER'), getSingleOrder)
router.get('/admin/orders', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), getAllOrders)

router.post('/user/orders/create', authenticateUser, authorizePermissions('CUSTOMER'), createOrderNew)
// router.post('/user/orders/create/new', authenticateUser, authorizePermissions('CUSTOMER'), createOrderNew)
router.get('/user/orders', authenticateUser, authorizePermissions('CUSTOMER'), getOwnUserOrders)

router.get('/vendor/orders', authenticateUser, authorizePermissions('VENDOR'), getOwnVendorOrders)
router.get('/vendor/orders/:orderId/accept', authenticateUser, authorizePermissions('VENDOR'), acceptOrder)
router.get('/vendor/orders/:orderId/reject', authenticateUser, authorizePermissions('VENDOR'), rejectOrder)

router.get('/driver/orders', authenticateUser, authorizePermissions('DRIVER'), getOwnDriverOrders)
router.get('/driver/orders/available', authenticateUser, authorizePermissions('DRIVER'), getAvailableOrders)
router.get('/driver/orders/:orderId/deliver', authenticateUser, authorizePermissions('DRIVER'), deliverOrder)
router.get('/driver/orders/:orderId/finalize', authenticateUser, authorizePermissions('DRIVER'), finalizeOrderDelivery)
router.get('/driver/orders/:orderId/delay', authenticateUser, authorizePermissions('DRIVER'), delayOrderDeliveryTime)

module.exports = router
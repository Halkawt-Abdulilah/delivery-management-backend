const express = require('express')
const router = express.Router()

const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, getVendorProducts, getOwnVendorProducts, userSearch, createOwnVendorProduct, } = require('../controllers/productController')
const { authenticateUser, authorizePermissions } = require('../middlewares/authentication')

router.get('/products', authenticateUser, authorizePermissions('ADMIN'), getAllProducts)
router.post('/products/create', authenticateUser, authorizePermissions('ADMIN'), createProduct)

router.get('/vendor/products', authenticateUser, authorizePermissions('VENDOR'), getOwnVendorProducts)
router.post('/vendor/products/create', authenticateUser, authorizePermissions('VENDOR'), createOwnVendorProduct)

router.get('/product/:id', authenticateUser, authorizePermissions('ADMIN', 'VENDOR', 'CUSTOMER'), getSingleProduct)
router.patch('/product/:id', authenticateUser, authorizePermissions('ADMIN', 'VENDOR'), updateProduct)
router.delete('/product/:id', authenticateUser, authorizePermissions('ADMIN', 'VENDOR'), deleteProduct)

router.get('/vendors/:id/products', authenticateUser, authorizePermissions('CUSTOMER'), getVendorProducts)
router.get('/products/search', authenticateUser, authorizePermissions('CUSTOMER'), userSearch)

module.exports = router
const express = require('express')
const router = express.Router()
const { authenticateUser, authorizePermissions } = require('../middlewares/authentication')

const { registerVendor, registerDriver, serverInitialize, registerAdmin } = require('../controllers/authController')
const { createVendor } = require('../controllers/vendorController')
const { getUserInfo, updateUserInfo, changeUserImage } = require('../controllers/userController')
const { createProduct } = require('../controllers/productController')

router.post('/server/initialize', serverInitialize)

router.post('/users/register-vendor', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), registerVendor)
router.post('/users/register-driver', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), registerDriver)
router.post('/users/register-admin', authenticateUser, authorizePermissions('SUPERADMIN'), registerAdmin)
router.post('/vendors/create', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), createVendor)
router.post('/products/create', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), createProduct)

router.get('/users/:id/details', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), getUserInfo)
router.post('/users/:id/edit', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), updateUserInfo)
router.post('/users/:id/change-image', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), changeUserImage)

module.exports = router
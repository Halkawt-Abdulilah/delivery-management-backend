const express = require('express')
const router = express.Router()
const { authenticateUser, authorizePermissions } = require('../middlewares/authentication')
const { dashboardLogin, dashboardHomeInfo, dashboardProfileInfo, dashboardProfileUpdateGeneralInfo, dashboardProfileUpdatePassword, dashboardFetchUsers, dashboardUpdateUser, dashboardCreateUser, dashboardDeleteUser, dashboardFetchVendors, dashboardUpdateVendor, dashboardCreateVendor, dashboardDeleteVendor, dashboardFetchOrders, dashboardUpdateOrder, dashboardFetchProducts, dashboardUpdateProduct, dashboardCreateProduct, dashboardDeleteProduct } = require('../controllers/dashboardController')
const { uploadVendorProfile, uploadVendorBackground, uploadUserProfile, uploadVendorProductImage } = require('../controllers/uploadController')

router.post('/login', dashboardLogin)
router.get('/home/info', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardHomeInfo)
router.get('/profile/info', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardProfileInfo)
router.patch('/profile/password-update', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardProfileUpdatePassword)
router.patch('/profile/general-update', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardProfileUpdateGeneralInfo)
// vendors
router.get('/vendors', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardFetchVendors)
router.post('/vendors/create', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardCreateVendor)
router.patch('/vendors/:id/update', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardUpdateVendor)
router.delete('/vendors/:id/delete', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardDeleteVendor)
router.post('/vendors/upload-profile', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), uploadVendorProfile)
router.post('/vendors/upload-background', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), uploadVendorBackground)
// users
router.get('/users', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardFetchUsers)
router.post('/users/:id/image/upload', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), uploadUserProfile)
router.patch('/users/:id/update', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardUpdateUser)
router.post('/users/create', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardCreateUser)
router.delete('/users/:id/delete', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardDeleteUser)
// orders
router.get('/orders', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardFetchOrders)
router.patch('/orders/:id/update', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardUpdateOrder)
// products
router.post('/vendors/:id/products/upload', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), uploadVendorProductImage)
router.get('/products', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardFetchProducts)
router.post('/products/create', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardCreateProduct)
router.patch('/products/:id/update', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardUpdateProduct)
router.delete('/products/:id/delete', authenticateUser, authorizePermissions('SUPERADMIN', 'ADMIN'), dashboardDeleteProduct)

module.exports = router
const express = require('express')
const router = express.Router()
const { authenticateUser, authorizePermissions } = require('../middlewares/authentication')

const { registerVendor, registerDriver } = require('../controllers/authController')
const { createVendor } = require('../controllers/vendorController')
const { getUserInfo, updateUserInfo, changeUserImage } = require('../controllers/userController')

router.post('/users/register-vendor', authenticateUser, authorizePermissions('ADMIN'), registerVendor)
router.post('/users/register-driver', authenticateUser, authorizePermissions('ADMIN'), registerDriver)
router.post('/vendors/create', authenticateUser, authorizePermissions('ADMIN'), createVendor)

router.get('/users/:id/details', authenticateUser, authorizePermissions('ADMIN'), getUserInfo)
router.post('/users/:id/edit', authenticateUser, authorizePermissions('ADMIN'), updateUserInfo)
router.post('/users/:id/change-image', authenticateUser, authorizePermissions('ADMIN'), changeUserImage)

module.exports = router
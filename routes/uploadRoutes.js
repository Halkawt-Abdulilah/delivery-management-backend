const express = require('express')
const router = express.Router()

const { authenticateUser, authorizePermissions } = require('../middlewares/authentication')
const { uploadProductImage, uploadVendorBackground, uploadVendorProfile, uploadOwnUserProfile, uploadUserProfile } = require('../controllers/uploadController')

router.post('/vendor/product/image/upload', authenticateUser, authorizePermissions('VENDOR'), uploadProductImage)
router.post('/user/profile/image/upload', authenticateUser, authorizePermissions('CUSTOMER'), uploadOwnUserProfile)

module.exports = router
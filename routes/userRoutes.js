const express = require('express')
const router = express.Router()
const { authenticateUser, authorizePermissions } = require('../middlewares/authentication')
const { updateOwnUserInfo, getOwnUserInfo, sendVerificationPinToUser, changeOwnNumber, getOwnUserAddresses, changeOwnImage, changeOwnPassword, addOwnUserAddress, setDefaultAddress, getOwnAddress } = require('../controllers/userController')

// general info
router.get('/profile', authenticateUser, authorizePermissions('CUSTOMER'), getOwnUserInfo)
router.post('/profile/edit', authenticateUser, authorizePermissions('CUSTOMER'), updateOwnUserInfo)

// phone number
router.post('/profile/initiate-number-change', authenticateUser, authorizePermissions('CUSTOMER'), sendVerificationPinToUser)
router.post('/profile/verify-number-change', authenticateUser, authorizePermissions('CUSTOMER'), changeOwnNumber)

// password
router.post('/profile/change-password', authenticateUser, authorizePermissions('CUSTOMER'), changeOwnPassword)

// image
router.post('/profile/change-image', authenticateUser, authorizePermissions('CUSTOMER'), changeOwnImage)

// address
router.get('/profile/addresses', authenticateUser, authorizePermissions('CUSTOMER'), getOwnUserAddresses)
router.get('/profile/addresses/:id', authenticateUser, authorizePermissions('CUSTOMER'), getOwnAddress)
router.post('/profile/addresses/create', authenticateUser, authorizePermissions('CUSTOMER'), addOwnUserAddress)
router.post('/profile/addresses/:id/favorite', authenticateUser, authorizePermissions('CUSTOMER'), setDefaultAddress)

module.exports = router
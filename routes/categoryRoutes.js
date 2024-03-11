const express = require('express')
const router = express.Router()
const { authenticateUser, authorizePermissions } = require('../middlewares/authentication')
const { fetchVendorCategories, fetchProductCategories } = require('../controllers/categoryController')

router.get('/categories/vendor', authenticateUser, fetchVendorCategories)
router.get('/categories/product', authenticateUser, fetchProductCategories)

module.exports = router
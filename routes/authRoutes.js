const express = require('express')
const router = express.Router()
const { login, registerCustomer, verifyNumber, resendVerificationPin } = require('../controllers/authController')

router.post('/login', login)
router.post('/register', registerCustomer)
router.post('/verify-number', verifyNumber)
router.post('/resend-pin', resendVerificationPin)

router.get('/logout', async (req, res) => {
    res.send("logout")
})

module.exports = router
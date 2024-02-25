const CustomError = require('../errors')
const { verifyToken } = require('../utils/jwt')

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization

    const token = authHeader.split(" ")[1]

    if (!token) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }

    try {
        const payload = verifyToken(token)

        const vendor_id = payload.vendor_id ? payload.vendor_id : ''
        const vendor_name = payload.vendor_name ? payload.vendor_name : ''

        req.user = {
            user_id: payload.user_id,
            number: payload.number,
            role: payload.role,
            vendor_id,
            vendor_name,
        }

        // console.log(req.user);

        next()

    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Error')
    }
}

const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new CustomError.UnauthorizedError("Unauthorized")
        }
        next()
    }
}

module.exports = {
    authenticateUser,
    authorizePermissions,
}
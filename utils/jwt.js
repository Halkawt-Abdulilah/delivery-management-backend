const jwt = require('jsonwebtoken')

const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token
}

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = {
    createJWT,
    verifyToken,
}
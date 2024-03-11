const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors');

const { UserSchema } = require('../models/UserSchema');
const { encryptInput, compareInput, generatePin } = require('../utils/bcrypt');
const { createJWT } = require('../utils/jwt');

const prisma = new PrismaClient()

const login = async (req, res) => {
    const { number, password } = req.body

    if (!number) {
        throw new CustomError.BadRequestError("Please provide phone number")
    }

    const user = await prisma.user.findUnique({
        where: { number }
    })

    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }

    const isPasswordCorrect = await compareInput(password, user.password)
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }

    const tokenTimestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 24

    if (user.role === "VENDOR") {
        const vendor = await prisma.vendor.findFirst({
            where: { user_id: user.id }
        })

        const token = createJWT({
            payload: {
                user_id: user.id,
                vendor_id: vendor.id,
                vendor_name: vendor.vendor_name,
                number: user.number,
                jfirst_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            }
        })

        return res.status(StatusCodes.OK).json({ token, role: user.role, expiresIn: tokenTimestamp })
    }

    const token = createJWT({
        payload: {
            user_id: user.id,
            number: user.number,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
        }
    })

    return res.status(StatusCodes.OK).json({ token, role: user.role, expiresIn: tokenTimestamp })
}

// TODO: fix errors not "reaching" error handler middleware
const registerUser = async (req, res) => {
    const { firstName, lastName, number, password, passwordConfirm, role } = req.body

    const numberExists = await prisma.user.findUnique({
        where: {
            number
        }
    })

    if (numberExists) {
        throw new CustomError.BadRequestError("Number already registered")
    }

    if (!password == passwordConfirm) {
        throw new CustomError.BadRequestError("Passwords do not match")
    }

    try {
        const validatedUser = UserSchema.parse({ number, first_name: firstName, last_name: lastName, password, role })

        const hashedPassword = await encryptInput(password)
        const pin = generatePin()
        const hashedPin = await encryptInput(pin)

        const user = await prisma.user.create({
            data: {
                ...validatedUser,
                password: hashedPassword,
                verification_pin: hashedPin,
            }
        })

        if (role === "CUSTOMER") {
            const result = await prisma.cart.create({
                data: {
                    user_id: user.id
                }
            })
        }

        // TODO: send pin through SMS
        console.log(pin);

        // res.status(StatusCodes.CREATED).json({ msg: user })
        res.status(StatusCodes.CREATED).json({ msg: 'Account created successfuly!', pin })

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json(error.issues)
    }
}

const registerCustomer = async (req, res) => {
    req.body.role = 'CUSTOMER'
    await registerUser(req, res)
}

const registerVendor = async (req, res) => {
    req.body.role = 'VENDOR'
    registerUser(req, res)
}

const registerDriver = async (req, res) => {
    req.body.role = 'DRIVER'
    registerUser(req, res)
}

const registerAdmin = async (req, res) => {
    req.body.role = 'ADMIN'
    registerUser(req, res)
}

const verifyNumber = async (req, res) => {
    const { pin, number } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { number }
        })

        if (!user) {
            throw new CustomError.UnauthenticatedError('Verification failed');
        }

        const isPinMatch = await compareInput(pin, user.verification_pin)

        if (!isPinMatch) {
            throw new CustomError.UnauthenticatedError('Invalid Verification Pin');
        }

        const updatedUser = {
            ...user,
            isVerified: true,
            verified: new Date(),
            verification_pin: '',
        }

        const verifiedUser = await prisma.user.update({
            where: { number }, data: { ...updatedUser }
        })

        res.status(StatusCodes.OK).json({ msg: 'Number verified' })
    } catch (error) {
        throw error
    }

}

const resendVerificationPin = async (req, res) => {
    const { number } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { number }
        })

        if (!user) {
            throw new CustomError.UnauthenticatedError('Number doesn\'t exist, please create an account');
        }

        const pin = generatePin()
        const hashedPin = await encryptInput(pin)

        const updatedUserPin = await prisma.user.update({
            where: { number }, data: { verification_pin: hashedPin }
        })

        // TODO: send sms
        console.log(pin);

        res.status(StatusCodes.OK).json({ msg: 'verification pin resent', pin })

    } catch (error) {
        throw error
    }

}

const serverInitialize = async (req, res) => {
    const { secret, firstName, lastName, number, password, passwordConfirm } = req.body

    if (secret != process.env.INIT_SECRET) {
        throw new CustomError.UnauthorizedError("Unauthorized")
    }

    const superAdminInitialized = await prisma.user.findFirst({
        where: {
            role: "SUPERADMIN"
        }
    })

    if (superAdminInitialized) {
        throw new CustomError.BadRequestError("Superadmin already exists")
    }

    if (!password == passwordConfirm) {
        throw new CustomError.BadRequestError("Passwords do not match")
    }

    try {
        const validatedUser = UserSchema.parse({ number, first_name: firstName, last_name: lastName, password, role: "SUPERADMIN" })

        const hashedPassword = await encryptInput(password)

        const user = await prisma.user.create({
            data: {
                ...validatedUser,
                password: hashedPassword,
                verification_pin: "",
                isVerified: true,
                verified: new Date(Date.now()),
            }
        })

        res.status(StatusCodes.CREATED).json({ msg: 'Admin registered successfuly' })

    } catch (error) {
        throw error
    }

}


module.exports = {
    login,
    registerCustomer,
    registerVendor,
    registerDriver,
    registerAdmin,
    verifyNumber,
    resendVerificationPin,
    serverInitialize,
}
const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2;
const CustomError = require('../errors');

const { UserInfoSchema } = require('../models/UserSchema');
const { generatePin, encryptInput, compareInput } = require('../utils/bcrypt');
const fs = require('fs');
const AddressSchema = require('../models/AddressSchema');
const { createJWT } = require('../utils/jwt');

const prisma = new PrismaClient()

const getUserInfo = async (req, res) => {
    const { id } = req.params
    try {
        const userInfo = await prisma.user.findUnique({
            where: {
                id
            }
        })

        if (!userInfo) {
            throw new CustomError.NotFoundError("User not found")
        }

        res.status(StatusCodes.OK).json({ userInfo })
    } catch (error) {
        throw error
    }
}

const changeUserImage = async (req, res) => {

    const { id } = req.params

    try {
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
            use_filename: false,
            folder: 'profiles',
            public_id: id,
        });

        fs.unlinkSync(req.files.image.tempFilePath)

        const updatedUserImage = await prisma.user.update({
            where: { id },
            data: { image: result.secure_url }
        })

        res.status(StatusCodes.OK).json({ msg: 'Profile Picture changed successfuly' })

    } catch (error) {
        throw error
    }

}

// TODO
const updateUserInfo = async (req, res) => {
    const { id } = req.params
    const { full_name, dob, gender } = req.body
    res.status(200).json({ action: "updating user info" })
}

const getOwnUserInfo = async (req, res) => {
    try {
        const userInfo = await prisma.user.findUnique({
            where: {
                id: req.user.user_id
            }
        })

        if (!userInfo) {
            throw new CustomError.NotFoundError("What are you doing here lol")
        }

        res.status(StatusCodes.OK).json({ userInfo })
    } catch (error) {
        throw error
    }
}


const changeOwnImage = async (req, res) => {

    try {
        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
            use_filename: false,
            folder: 'profiles',
            public_id: req.user.user_id,
        });

        fs.unlinkSync(req.files.image.tempFilePath)

        const updatedUserImage = await prisma.user.update({
            where: { id: req.user.user_id }, data: { image: result.secure_url }
        })

        res.status(StatusCodes.OK).json({ msg: 'Profile Picture changed successfuly' })

    } catch (error) {
        throw error
    }

}

const updateOwnUserInfo = async (req, res) => {

    const { fullName, dob, gender } = req.body

    try {
        const newInfo = UserInfoSchema.parse({ full_name: fullName, gender, dob })


        const updatedUserInfo = await prisma.user.update({
            where: { number: req.user.number },
            data: { ...newInfo }
        })

        res.status(StatusCodes.OK).json({ msg: "Profile Information updated Successfuly" })

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json(error.issues)
    }
}

const changeOwnPassword = async (req, res) => {
    const { password, passwordConfirm } = req.body
    try {

        if (!password == passwordConfirm) {
            throw new CustomError.BadRequestError("Password mismatch")
        }

        const hashedPassword = await encryptInput(password)

        const userInfo = await prisma.user.update({
            where: { number: req.user.number },
            data: { password: hashedPassword }
        })
        res.status(StatusCodes.OK).json({ msg: 'password changed successfuly' })
    } catch (error) {

    }
}

const sendVerificationPinToUser = async (req, res) => {
    const { number } = req.body

    const pin = generatePin()
    const hashedPin = await encryptInput(pin)

    console.log(pin);

    // TODO: SMS implementation, sending unencrypted pin to user
    try {
        const updatedUserInfo = await prisma.user.update({
            where: { number: req.user.number },
            data: { verification_pin: hashedPin }
        })

        res.status(StatusCodes.OK).json({ msg: 'verification pin sent to number' })

    } catch (error) {
        throw error
    }
}

const changeOwnNumber = async (req, res) => {
    const { pin, number } = req.body

    try {
        const activeUser = await prisma.user.findUnique({
            where: { id: req.user.user_id, isVerified: true }
        })

        if (!activeUser) {
            throw new CustomError.BadRequestError('Bad request')
        }

        const isPinMatch = await compareInput(pin, activeUser.verification_pin)
        if (!isPinMatch) {
            throw new CustomError.BadRequestError('Invalid verification pin')
        }

        const updatedUserInfo = await prisma.user.update({
            where: { id: req.user.user_id },
            data: { number }
        })

        const newTokenInfo = { ...req.user, number }
        const newToken = createJWT({ payload: newTokenInfo })

        res.status(StatusCodes.OK).json({ msg: 'Phone number changed successfuly!', newToken })

    } catch (error) {
        throw error
    }
}

const getOwnUserAddresses = async (req, res) => {
    try {
        const userAddresses = await prisma.userAddress.findMany({
            where: {
                user_id: req.user.user_id
            }
        })

        res.status(StatusCodes.OK).json({ addresses: userAddresses })

    } catch (error) {
        throw error
    }
}

const getOwnAddress = async (req, res) => {

    const { id } = req.params

    try {
        const userAddress = await prisma.userAddress.findUnique({
            where: {
                user_id: req.user.user_id,
                id: parseInt(id),
            }
        })

        if (!userAddress) {
            throw new CustomError.NotFoundError('Address not found')
        }

        res.status(StatusCodes.OK).json({ addresses: userAddress })

    } catch (error) {
        throw error
    }
}

const addOwnUserAddress = async (req, res) => {
    const { address, longitude, latitude, description, isPrimary } = req.body

    try {

        if (isPrimary) {
            const currentDefault = await prisma.userAddress.update({
                where: {
                    user_id: req.user.user_id,
                    is_primary: true,
                },
                data: {
                    is_primary: false
                }
            })

            isPrimary = true
        }

        const newAddressInfo = AddressSchema.parse({ address, longitude, latitude, description })

        const newAddress = await prisma.userAddress.create({
            data: {
                user_id: req.user.user_id,
                ...newAddressInfo,
                is_primary: isPrimary,
            }
        })

        res.status(StatusCodes.CREATED).json({ msg: 'Address added successfuly!' })

    } catch (error) {
        throw error
    }
}

const setDefaultAddress = async (req, res) => {
    const { id } = req.params


    try {

        // or findFirst => check if it is default, then update addresses

        const result = await prisma.$queryRaw`
            UPDATE public."UserAddress"
            SET is_primary = false
            WHERE user_id = ${req.user.user_id}
            AND is_primary = true
        `;

        const newDefault = await prisma.userAddress.update({
            where: {
                id: parseInt(id),
                user_id: req.user.user_id,
            },
            data: {
                is_primary: true
            }
        })

        res.status(StatusCodes.OK).json({ msg: 'Address set as default' })

    } catch (error) {
        throw error
    }
}

module.exports = {
    getUserInfo,
    updateUserInfo,
    changeUserImage,
    getOwnUserInfo,
    updateOwnUserInfo,
    changeOwnImage,
    changeOwnPassword,
    sendVerificationPinToUser,
    changeOwnNumber,
    getOwnUserAddresses,
    addOwnUserAddress,
    setDefaultAddress,
    getOwnAddress,
}
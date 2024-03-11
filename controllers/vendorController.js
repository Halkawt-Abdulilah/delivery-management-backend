const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes')

const CustomError = require('../errors')
const prisma = new PrismaClient()
const fs = require('fs')

const createVendor = async (req, res) => {
    const { userId, name, address, longitude, latitude, prepareTime, deliveryTime, discount, profile, background } = req.body

    try {

        const registeredVendor = await prisma.vendor.findFirst({
            where: { user_id: userId }
        })

        if (registeredVendor) {
            throw new CustomError.BadRequestError(`Another vendos already registered under user ${userId}`)
        }

        const vendor = await prisma.vendor.create({
            data: {
                user_id: userId,
                vendor_name: name,
                address,
                longitude,
                latitude,
                discount,
                prep_time: prepareTime,
                delivery_time: deliveryTime,
                profile_image: profile,
                background_image: background,
            }
        })

        res.status(StatusCodes.CREATED).json({ vendor })

    } catch (error) {
        throw error
    }

}

module.exports = {
    createVendor
}
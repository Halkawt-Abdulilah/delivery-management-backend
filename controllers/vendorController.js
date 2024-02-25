const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2;

const CustomError = require('../errors')
const prisma = new PrismaClient()
const fs = require('fs')

const createVendor = async (req, res) => {
    const { userId, name, address, longitude, latitude, discount } = req.body

    try {

        const registeredVendor = await prisma.vendor.findFirst({
            where: { user_id: userId }
        })

        if (registeredVendor) {
            throw new CustomError.BadRequestError(`Another vendos already registered under user ${userId}`)
        }

        const profileResult = await cloudinary.uploader.upload(req.files.profile.tempFilePath, {
            use_filename: false,
            folder: 'vendors',
            public_id: `${name}_profile`,
            
        });

        const backgroundResult = await cloudinary.uploader.upload(req.files.background.tempFilePath, {
            use_filename: false,
            folder: 'vendors',
            public_id: `${name}_background`,
        });

        fs.unlinkSync(req.files.profile.tempFilePath)
        fs.unlinkSync(req.files.background.tempFilePath)

        const vendor = await prisma.vendor.create({
            data: {
                user_id: userId,
                vendor_name: name,
                address,
                longitude,
                latitude,
                discount,
                profile_image: profileResult.secure_url,
                background_image: backgroundResult.secure_url,
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
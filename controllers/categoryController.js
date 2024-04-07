const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes')

const prisma = new PrismaClient()


const fetchVendorCategories = async (req, res) => {
    try {
        const result = await prisma.vendorCategory.findMany({})

        res.status(StatusCodes.OK).json({ result })

    } catch (error) {
        throw error
    }
}
const fetchProductCategories = async (req, res) => {
    try {
        const result = await prisma.productCategory.findMany({})

        let categories = []
        result.forEach((item) => categories.push(item.name))

        res.status(StatusCodes.OK).json({ categories })

    } catch (error) {
        throw error
    }
}

module.exports = {
    fetchVendorCategories,
    fetchProductCategories,
}
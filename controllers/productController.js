const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes')

const productSchema = require('../models/ProductSchema')
const CustomError = require('../errors')
const fs = require('fs')
const prisma = new PrismaClient()



// -------  CRUD  -------

const createProduct = async (req, res) => {
    const { name, description, price, prepTime, category, vendorId, image } = req.body
    try {
        const validatedProduct = productSchema.parse({ name, description, price, prep_time: prepTime })

        const product = await prisma.product.create({
            data: {
                ...validatedProduct,
                category: category,
                vendor_id: vendorId,
                image
            }
        })

        res.status(StatusCodes.OK).json(product)

    } catch (error) {
        throw error
    }
}

const getAllProducts = async (req, res) => {

    const products = await prisma.product.findMany({})
    res.status(StatusCodes.OK).json(products)

}

const updateProduct = async (req, res) => {
    const { id } = req.params
    const { name, price, description } = req.body

    try {
        const validatedProduct = productSchema.parse({ name, description, price })

        const updatedProduct = await prisma.product.update({
            where: { id: id, vendor_id: req.user.vendor_id },
            data: { ...validatedProduct }
        })

        res.status(StatusCodes.OK).json({ updatedProduct })

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json(error.issues)
    }

}

const deleteProduct = async (req, res) => {
    const { id } = req.params

    try {
        const deletedProduct = await prisma.product.delete({
            where: {
                id, vendor_id: req.user.vendor_id,
            }
        })
        res.status(StatusCodes.OK).json({ deletedProduct })

    } catch (error) {
        throw new Error("Product record not found")
    }
}

// -------  end of CRUD  -------


const getOwnVendorProducts = async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: req.user.vendor_id }
        })

        if (!vendor) {
            throw new CustomError.NotFoundError('Vendor not found')
        }

        const products = await prisma.product.findMany({
            where: { vendor_id: req.user.vendor_id }
        })

        res.status(StatusCodes.OK).json({ products })
    } catch (error) {
        throw error
    }
}

const createOwnVendorProduct = async (req, res) => {

    const { name, description, price, prepTime, category, url } = req.body
    try {

        const validatedProduct = productSchema.parse({ name, description, price: parseInt(price), prep_time: parseInt(prepTime), })

        const product = await prisma.product.create({
            data: {
                ...validatedProduct,
                vendor_id: req.user.vendor_id,
                image: url,
                category
            }
        })

        res.status(StatusCodes.OK).json(product)
    } catch (error) {
        throw error
    }
}

const getVendorProducts = async (req, res) => {
    const { id } = req.params
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id }
        })

        if (!vendor) {
            throw new CustomError.NotFoundError('Vendor not found')
        }

        const products = await prisma.product.findMany({
            where: { vendor_id: id }
        })

        res.status(StatusCodes.OK).json({ products })

    } catch (error) {
        throw error
    }
}

const getSingleProduct = async (req, res) => {
    const { id } = req.params

    const product = await prisma.product.findUnique({
        where: {
            id
        }
    })

    if (!product) {
        throw new CustomError.NotFoundError("Product not found")
    }

    res.status(StatusCodes.OK).json(product)
}

const userSearch = async (req, res) => {
    const { name } = req.query

    try {
        const vendors = await prisma.vendor.findMany({
            where: {
                vendor_name: {
                    contains: name
                }
            }
        })

        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: name
                }
            }
        })

        res.status(StatusCodes.OK).json({ vendors, products })

    } catch (error) {
        throw error
    }

}

module.exports = {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getVendorProducts,
    getOwnVendorProducts,
    createOwnVendorProduct,
    getSingleProduct,
    userSearch,
}
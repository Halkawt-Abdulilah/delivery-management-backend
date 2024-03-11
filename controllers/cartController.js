const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors');

const prisma = new PrismaClient()

const getCart = async (req, res) => {
    try {
        const cartItems = await prisma.cartItem.findMany({
            where: {
                cart: {
                    user_id: req.user.user_id
                }
            }
        });

        res.status(StatusCodes.OK).json({ cartItems })
    } catch (error) {
        throw error
    }
}

const addToCart = async (req, res) => {
    const { id, quantity } = req.body

    try {
        const productToAdd = await prisma.product.findUnique({
            where: {
                id: id
            }
        })

        const userCart = await prisma.cart.findUnique({
            where: {
                user_id: req.user.user_id
            }
        })

        const result = await prisma.cartItem.findFirst({
            where: {
                AND: [
                    {
                        item_id: id
                    },
                    {
                        cart: {
                            user_id: req.user.user_id
                        }
                    }
                ]
            }
        })

        if (result) {
            const updated = await prisma.cartItem.update({
                where: {
                    id: result.id,
                    cart: {
                        user_id: req.user.user_id
                    },
                    item_id: id
                },
                data: {
                    deleted: false,
                    quantity,
                    subtotal: productToAdd.price * quantity
                }
            })

            return res.status(StatusCodes.OK).json({ msg: "Product added to cart" })
        }
        const added = await prisma.cartItem.create({
            data: {
                cart_id: userCart.id,
                item_id: productToAdd.id,
                quantity,
                subtotal: productToAdd.price * quantity
            }
        })

        res.status(StatusCodes.OK).json({ msg: "Product added to cart" })


    } catch (error) {
        throw error
    }
}

const removeFromCart = async (req, res) => {
    const { id, quantity } = req.body

    try {

        const productToRemove = await prisma.product.findUnique({
            where: {
                id
            }
        })

        const userCart = await prisma.cart.findFirst({
            where: { user_id: req.user.user_id }
        })

        const currentItem = await prisma.cartItem.findFirst({
            where: {
                cart: {
                    user_id: req.user.user_id
                },
                item_id: id
            },
        })

        console.log(currentItem);

        if (quantity === 0) {
            const deleted = await prisma.cartItem.update({
                where: {
                    id: currentItem.id,
                    cart: {
                        user_id: req.user.user_id
                    },
                    item_id: id
                },
                data: {
                    deleted: true,
                    quantity: 0,
                    subtotal: 0,
                }
            })
            return res.status(StatusCodes.OK).json({ msg: "product deleted from cart" })
        }

        const result = await prisma.cartItem.update({
            where: {
                id: currentItem.id,
                cart: {
                    user_id: req.user.user_id
                },
                item_id: id
            },
            data: {
                quantity: quantity,
                subtotal: productToRemove.price * quantity,
            }
        })

        res.status(StatusCodes.OK).json({ msg: "product amount in cart reduced" })

    } catch (error) {
        throw error
    }
}

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
}
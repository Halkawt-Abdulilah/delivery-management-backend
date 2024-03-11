const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes')

const prisma = new PrismaClient()

const createOrderNew = async (req, res) => {

    const { address } = req.body

    try {
        const cartItems = await prisma.cartItem.findMany({
            where: {
                cart: {
                    user_id: req.user.user_id
                },
                deleted: false,
            },
            include: {
                Product: {
                    include: {
                        vendor: true,
                    },
                },
            },
        });

        const { discount, delivery_time, id } = cartItems[0].Product.vendor

        let total = 0
        let prepareTime = 0

        cartItems.forEach((item) => {
            total += Number.parseInt(item.subtotal)
            if (prepareTime < item.Product.prep_time) {
                prepareTime = item.Product.prep_time
            }

        })

        // console.log(id)
        const order = await prisma.order.create({
            data: {
                user_id: req.user.user_id,
                vendor_id: id,
                status: "pending",
                prep_time: prepareTime,
                delivering_to: address,
                delivering_at: new Date(Date.now() + delivery_time * 60000),
                total,
            }
        })

        let orderItems = []
        cartItems.forEach((item) => {
            orderItems.push({
                order_id: order.id,
                item_id: item.item_id,
                quantity: item.quantity,
                subtotal: item.subtotal,
            })
        })


        const orderItemsTransferred = await prisma.orderItem.createMany({
            data: orderItems
        })

        const cartItemsDeleted = await prisma.cartItem.updateMany({
            where: {
                OR: cartItems.map(item => ({ id: item.id })),
            },
            data: {
                deleted: {
                    set: true,
                },
            }
        })

        res.status(200).json({ msg: "order created" })

        // const userCartItems = await prisma.cartItem.findMany({
        //     where: {
        //         cart: {
        //             user_id: req.user.user_id
        //         }
        //     }
        // })

        // const vendorInfo = await prisma.vendor.findFirst({
        //     where: {
        //         Product: {

        //         }
        //     }
        // })
    } catch (error) {
        throw error
    }
}

const createOrder = async (req, res) => {
    // expecting total, delivery fee, address_id, and order items
    // items: [{item_id, quantity, total}]
    const { total, items, delivery_fee, address_id } = req.body

    const productIds = items.map(item => item.item_id)

    try {

        const orderVendorId = await prisma.product.findUnique({
            where: { id: productIds[0] },
            select: { vendor_id: true }
        })

        // TODO: check longestPrepTime
        // const longestPrepTimeQuery = `FROM Product SELECT prep_time WHERE id in $`

        const longestPrepTime = await prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
            },
            select: {
                prep_time: true
            },
            orderBy: {
                prep_time: "desc",
            },
            take: 1,
        })

        const order = await prisma.order.create({
            data: {
                user_id: req.user.user_id,
                vendor_id: orderVendorId.vendor_id,
                status: 'pending',
                prep_time: longestPrepTime[0].prep_time,
                delivering_to: address_id,
                // delivery_fee,        TODO
                total
            }
        })

        const itemsWithOrderId = items.map((item) => ({
            ...item,
            order_id: order.id
        }))

        const orderItems = await prisma.orderItem.createMany({
            data: itemsWithOrderId
        })

        res.status(StatusCodes.OK).json('Order created')

    } catch (error) {
        throw error
    }
}

const getAllOrders = async (req, res) => {

    const { status, userId, vendorId, driverId } = req.query

    try {
        const orders = await prisma.order.findMany({
            where: {
                status,
                user_id: userId,
                vendor_id: vendorId,
                driver_id: driverId,
            }
        })

        res.status(StatusCodes.OK).json({ orders })
    } catch (error) {
        throw error
    }
}

const getSingleOrder = async (req, res) => {
    const id = parseInt(req.params.id)

    console.log(req.params);

    try {
        const order = await prisma.order.findUnique({
            where: { id },
        });

        res.status(StatusCodes.OK).json({ order })
    } catch (error) {
        throw error
    }
}

// not sure if it will be needed for admin panel
const getUserOrders = async (req, res) => {
    const { id } = req.params

    try {
        const orders = await prisma.order.findMany({
            where: { user_id: id }
        })

        res.status(StatusCodes.OK).json({ orders })
    } catch (error) {
        throw error
    }

}

const getVendorOrders = async (req, res) => {

    const { id } = req.params

    try {
        const orders = await prisma.order.findMany({
            where: { vendor_id: id }
        })

        res.status(StatusCodes.OK).json({ orders })
    } catch (error) {
        throw error
    }

}

const getDriverOrders = async (req, res) => {
    const { id } = req.params

    try {
        const orders = await prisma.order.findMany({
            where: { driver_id: id }
        })

        res.status(StatusCodes.OK).json({ orders })
    } catch (error) {
        throw error
    }

}
// --------------------------------------------------

const getOwnUserOrders = async (req, res) => {

    try {
        const orders = await prisma.order.findMany({
            where: { user_id: req.user.user_id }
        })

        res.status(StatusCodes.OK).json({ orders })
    } catch (error) {
        throw error
    }

}

const getOwnVendorOrders = async (req, res) => {

    try {
        const orders = await prisma.order.findMany({
            where: { vendor_id: req.user.vendor_id }
        })

        res.status(StatusCodes.OK).json({ orders })
    } catch (error) {
        throw error
    }

}

const getOwnDriverOrders = async (req, res) => {

    try {
        const orders = await prisma.order.findMany({
            where: {
                driver_id: req.user.user_id,
            }
        })

        res.status(StatusCodes.OK).json({ orders })
    } catch (error) {
        throw error
    }

}

const getAvailableOrders = async (req, res) => {

    try {
        const orders = await prisma.order.findMany({
            where: {
                status: 'accepted'
            }
        })

        res.status(StatusCodes.OK).json({ orders })
    } catch (error) {
        throw error
    }

}

const acceptOrder = async (req, res) => {

    const { orderId } = req.params

    try {
        const acceptedOrder = await prisma.order.update({
            where: {
                vendor_id: req.user.vendor_id,
                id: parseInt(orderId),
            },
            data: {
                status: 'accepted'
            }
        })

        res.status(StatusCodes.OK).json({ msg: 'Order accepted, waiting for drivers...' })
    } catch (error) {
        throw error
    }

}
const rejectOrder = async (req, res) => {

    const { orderId } = req.params

    try {
        const acceptedOrder = await prisma.order.update({
            where: {
                vendor_id: req.user.vendor_id,
                id: parseInt(orderId),
            },
            data: {
                status: 'rejected',
            }
        })

        res.status(StatusCodes.OK).json({ msg: 'Order rejected.' })
    } catch (error) {
        throw error
    }

}
const deliverOrder = async (req, res) => {

    const { orderId } = req.params

    try {

        const prepTime = await prisma.order.findUnique({
            where: {
                id: parseInt(orderId),
            },
            select: {
                prep_time: true
            }
        })

        const acceptedOrder = await prisma.order.update({
            where: {
                id: parseInt(orderId),
            },
            data: {
                status: 'delivering',
                delivering_at: new Date(Date.now() + prepTime.prep_time * 60 * 1000)
            }
        })

        res.status(StatusCodes.OK).json({ msg: 'Order delivery taken.' })
    } catch (error) {
        throw error
    }

}
const finalizeOrderDelivery = async (req, res) => {

    const { orderId } = req.params

    try {
        const acceptedOrder = await prisma.order.update({
            where: {
                id: parseInt(orderId),
            },
            data: {
                status: 'delivered',
            }
        })

        res.status(StatusCodes.OK).json({ msg: 'Order delivered.' })
    } catch (error) {
        throw error
    }

}
const delayOrderDeliveryTime = async (req, res) => {
    const { orderId } = req.params

    try {
        const delayedOrder = await prisma.order.update({
            where: {
                id: parseInt(orderId),
            },
            data: {
                delivering_at: new Date(Date.now() + 5 * 60 * 1000)
            }
        })

        res.status(StatusCodes.OK).json({ msg: 'Order delivery delayed.' })
    } catch (error) {
        throw error
    }

}

module.exports = {
    createOrder,
    createOrderNew,
    getSingleOrder,
    getAllOrders,
    getUserOrders,
    getDriverOrders,
    getVendorOrders,
    getOwnUserOrders,
    getOwnVendorOrders,
    getOwnDriverOrders,
    acceptOrder,
    rejectOrder,
    deliverOrder,
    finalizeOrderDelivery,
    delayOrderDeliveryTime,
    getAvailableOrders,
}
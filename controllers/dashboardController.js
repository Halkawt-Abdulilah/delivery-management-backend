const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors');

const { encryptInput, compareInput } = require('../utils/bcrypt');
const { createJWT } = require('../utils/jwt');

const prisma = new PrismaClient()

const dashboardLogin = async (req, res) => {
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

    const userInfo = {
        first_name: user.first_name,
        last_name: user.last_name,
        profile: user.image
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

    return res.status(StatusCodes.OK).json({ user: userInfo, token })
}

const dashboardHomeInfo = async (req, res) => {

    const HOME_INFO = `
        SELECT
          CAST(COUNT(*) AS INTEGER) FILTER (WHERE public."User".created_at >= CURRENT_DATE) AS daily_new_users,
          COUNT(DISTINCT public."Order".id) AS orders_made_today,
          CAST(COUNT(*) AS INTEGER) AS items_ordered_today,
          CAST(SUM(public."Order".total) AS INTEGER) FILTER (WHERE public."User".created_at >= CURRENT_DATE) AS total_orders

    `;

    const USER_SQL = `SELECT CAST(COUNT(*) AS INTEGER) AS new_users_today
        FROM public."User"
        WHERE public."User".created_at >= date_trunc('week', CURRENT_DATE);
        `
    const ORDER_SQL = `SELECT CAST(SUM(public."OrderItem".quantity) AS INTEGER) AS items_ordered_today,
        CAST(COUNT(1) AS INTEGER) AS orders_today,
        CAST(SUM(public."Order".total) AS INTEGER) AS total_today
        FROM public."Order"
        INNER JOIN public."OrderItem" ON public."Order".id = public."OrderItem".order_id
        WHERE public."Order".ordered_at >= date_trunc('week', CURRENT_DATE);
        `
    const TEST = `SELECT *
        FROM public."User"
        WHERE created_at >= date_trunc('week', CURRENT_DATE);
        `


    try {
        const userResult = await prisma.$queryRawUnsafe(USER_SQL);
        const queryResult = await prisma.$queryRawUnsafe(ORDER_SQL);

        const orderResult = queryResult[0]

        const result = { ...orderResult, ...userResult[0] }

        console.log(result);
        res.status(200).json({ ...result })
    } catch (error) {
        throw error
    }
}

const dashboardProfileInfo = async (req, res) => {
    try {
        const result = await prisma.user.findUnique({
            where: {
                number: req.user.number
            },
            select: {
                id: true,
                number: true,
                first_name: true,
                last_name: true,
                role: true,
                image: true
            }
        })

        res.status(StatusCodes.OK).json({ result })
    } catch (error) {
        throw error
    }
}

const dashboardProfileUpdateGeneralInfo = async (req, res) => {
    const { firstName, lastName } = req.body

    try {
        const result = await prisma.user.update({
            where: { id: req.user.user_id },
            data: { first_name: firstName, last_name: lastName }
        })
        return res.status(StatusCodes.OK).json({ ok: true })
    } catch (error) {
        throw error
    }
}

const dashboardProfileUpdatePassword = async (req, res) => {

    console.log(req.body);

    const { password, passwordConfirm } = req.body
    try {

        if (!password == passwordConfirm) {
            throw new CustomError.BadRequestError("Password mismatch")
        }
        n
        const hashedPassword = await encryptInput(password)

        const userInfo = await prisma.user.update({
            where: { id: req.user.user_id },
            data: { password: hashedPassword }
        })
        res.status(StatusCodes.OK).json({ msg: 'password changed successfuly' })
    } catch (error) {
        throw error
    }
}

// -----------------------------------------------------

const dashboardFetchUsers = async (req, res) => {
    const { page, limit, search } = req.query

    try {
        if (search) {
            const result = await prisma.user.findMany({
                where: {
                    AND: {
                        OR: [
                            {
                                first_name: { contains: search }
                            },
                            {
                                last_name: { contains: search }
                            },
                            {
                                id: { contains: search },
                            },
                            {
                                number: { contains: search }
                            }
                        ],
                        NOT: {
                            OR: [
                                {
                                    role: 'SUPERADMIN',
                                },
                                {
                                    deleted: true,
                                }
                            ]
                        },
                    },
                },
                skip: parseInt(limit) * parseInt(page - 1),
                take: parseInt(limit),
            })
            console.log(result);

            return res.status(StatusCodes.OK).json({ result })
        }

        const result = await prisma.user.findMany({
            skip: parseInt(limit) * parseInt(page - 1),
            take: parseInt(limit),
            where: {
                NOT: {
                    OR: [
                        {
                            role: 'SUPERADMIN',
                        },
                        {
                            deleted: true,
                        }
                    ]
                }
            }
        })

        res.status(StatusCodes.OK).json({ result })
    } catch (error) {
        throw error
    }
}

const dashboardUpdateUser = async (req, res) => {

    const { firstName, lastName, role, number, image } = req.body
    const { id } = req.params

    try {
        const isUserSameRole = await prisma.user.findUnique({
            where: {
                id
            }
        })

        if (req.user.role === isUserSameRole.role || isUserSameRole === "SUPERADMIN") {
            throw new CustomError.UnauthorizedError('Unauthorized')
        }

        const result = await prisma.user.update({
            where: { id },
            data: {
                first_name: firstName,
                last_name: lastName,
                number,
                role,
                image
            }
        })

        res.status(StatusCodes.OK).json({ msg: "user updated successfully" })

    } catch (error) {

    }

    res.status(StatusCodes.OK).json({ link: result.secure_url })
}

const dashboardDeleteUser = async (req, res) => {
    const { id } = req.params

    console.log(id);

    try {
        const result = await prisma.user.update({
            where: { id },
            data: {
                deleted: true
            }
        })

        res.status(StatusCodes.CREATED).json({ msg: 'Account Deleted' })

    } catch (error) {
        throw error
    }

}
const dashboardCreateUser = async (req, res) => {
    const { firstName, lastName, password, role, number, image } = req.body

    const numberExists = await prisma.user.findUnique({
        where: {
            number
        }
    })

    if (numberExists) {
        throw new CustomError.BadRequestError("Number already registered")
    }

    try {

        const hashedPassword = await encryptInput(password)

        const user = await prisma.user.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                number,
                password: hashedPassword,
                role,
                image,
                verification_pin: "",
                isVerified: true,
                verified: new Date(Date.now()),
            }
        })

        res.status(StatusCodes.CREATED).json({ msg: 'Account created successfuly!' })

    } catch (error) {
        throw error
    }

}

// -----------------------------------------------------

const dashboardFetchVendors = async (req, res) => {
    const { page, limit, search } = req.query

    try {
        if (search) {
            const result = await prisma.vendor.findMany({
                where: {
                    AND: {
                        OR: [
                            {
                                vendor_name: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                        NOT: {
                            deleted: true,
                        },
                    },
                },
                skip: parseInt(limit) * parseInt(page - 1),
                take: parseInt(limit),
            })
            console.log(result);

            return res.status(StatusCodes.OK).json({ result })
        }


        const result = await prisma.vendor.findMany({
            skip: parseInt(limit) * parseInt(page - 1),
            take: parseInt(limit),
            where: {
                NOT: {
                    deleted: true,
                }
            }
        })

        console.log(result);

        res.status(StatusCodes.OK).json({ result })
    } catch (error) {
        throw error
    }
}

const dashboardCreateVendor = async (req, res) => {
    const { ownerId, vendorName, vendorAddress, deliveryTime, prepTime, vendorlongitude, vendorLatitude, vendorDiscount, profileImage, backgroundImage } = req.body

    try {

        const result = await prisma.vendor.create({
            data: {
                user_id: ownerId,
                vendor_name: vendorName,
                address: vendorAddress,
                longitude: vendorlongitude,
                latitude: vendorLatitude,
                discount: vendorDiscount,
                profile_image: profileImage,
                background_image: backgroundImage
            }
        })

        res.status(StatusCodes.CREATED).json({ msg: 'Account created successfuly!' })

    } catch (error) {
        throw error
    }

}

const dashboardUpdateVendor = async (req, res) => {

    const { ownerId, vendorName, vendorAddress, deliveryTime, prepTime, vendorlongitude, vendorLatitude, vendorDiscount, profileImage, backgroundImage } = req.body
    const { id } = req.params

    try {
        const result = await prisma.vendor.update({
            where: { id },
            data: {
                user_id: ownerId,
                vendor_name: vendorName,
                address: vendorAddress,
                longitude: vendorlongitude,
                latitude: vendorLatitude,
                discount: vendorDiscount,
                profile_image: profileImage,
                background_image: backgroundImage
            }
        })

        res.status(StatusCodes.OK).json({ msg: "vendor updated successfully" })

    } catch (error) {
        throw error
    }

}

const dashboardDeleteVendor = async (req, res) => {
    const { id } = req.params

    console.log(id);

    try {
        const result = await prisma.vendor.update({
            where: { id },
            data: {
                deleted: true
            }
        })

        res.status(StatusCodes.CREATED).json({ msg: 'Account Deleted' })

    } catch (error) {
        throw error
    }

}

// -----------------------------------------------------

const dashboardFetchOrders = async (req, res) => {
    const { page, limit, search } = req.query

    try {
        if (search) {
            const result = await prisma.order.findMany({
                where: {
                    AND: {
                        OR: [
                            {
                                id: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                        NOT: {
                            deleted: true,
                        },
                    },
                },
                skip: parseInt(limit) * parseInt(page - 1),
                take: parseInt(limit),
            })
            console.log(result);

            return res.status(StatusCodes.OK).json({ result })
        }


        const result = await prisma.order.findMany({
            skip: parseInt(limit) * parseInt(page - 1),
            take: parseInt(limit),
            where: {
                NOT: {
                    deleted: true,
                }
            },
            include: {
                vendor: true
            }
        })

        res.status(StatusCodes.OK).json({ result })
    } catch (error) {
        throw error
    }
}

const dashboardUpdateOrder = async (req, res) => {

    const { status } = req.body
    const { id } = req.params

    try {
        const result = await prisma.order.update({
            where: { id: Number.parseInt(id) },
            data: {
                status
            }
        })

        console.log(result);

        res.status(StatusCodes.OK).json({ msg: "order updated successfully" })

    } catch (error) {
        throw error
    }

}

const dashboardDeleteOrder = async (req, res) => {
    const { id } = req.params


    try {
        const result = await prisma.order.update({
            where: { id },
            data: {
                deleted: true
            }
        })

        res.status(StatusCodes.CREATED).json({ msg: 'Order Deleted' })

    } catch (error) {
        throw error
    }

}

// -----------------------------------------------------

const dashboardFetchProducts = async (req, res) => {
    const { page, limit, search } = req.query

    try {
        if (search) {
            const result = await prisma.product.findMany({
                where: {
                    AND: {
                        OR: [
                            {
                                name: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                        NOT: {
                            deleted: true,
                        },
                    },
                },
                skip: parseInt(limit) * parseInt(page - 1),
                take: parseInt(limit),
            })

            return res.status(StatusCodes.OK).json({ result })
        }


        const result = await prisma.product.findMany({
            skip: parseInt(limit) * parseInt(page - 1),
            take: parseInt(limit),
            where: {
                NOT: {
                    deleted: true,
                },
            },
            include: {
                vendor: true
            }
        })

        console.log(result);

        res.status(StatusCodes.OK).json({ result })
    } catch (error) {
        throw error
    }
}

const dashboardCreateProduct = async (req, res) => {
    const { vendor_id, name, description, price, available, category, prep_time, image } = req.body
    console.log(req.body)
    try {
        const result = await prisma.product.create({
            data: {
                name,
                description,
                price,
                available,
                category,
                prep_time,
                image,
                vendor_id,
            }
        })

        res.status(StatusCodes.CREATED).json({ msg: 'Product created successfuly!' })

    } catch (error) {
        throw error
    }

}

const dashboardUpdateProduct = async (req, res) => {

    const { vendor_id, name, description, price, available, category, prep_time, image } = req.body
    const { id } = req.params

    try {
        const result = await prisma.product.update({
            where: { id },
            data: {
                vendor_id,
                name,
                description,
                price,
                available,
                category,
                prep_time,
                image
            }
        })

        res.status(StatusCodes.OK).json({ msg: "product updated successfully" })

    } catch (error) {
        throw error
    }

}

const dashboardDeleteProduct = async (req, res) => {
    const { id } = req.params
    try {
        const result = await prisma.product.update({
            where: { id },
            data: {
                deleted: true
            }
        })

        res.status(StatusCodes.CREATED).json({ msg: 'Product Deleted' })

    } catch (error) {
        throw error
    }

}


module.exports = {
    dashboardLogin,
    dashboardHomeInfo,
    dashboardProfileInfo,
    dashboardProfileUpdatePassword,
    dashboardProfileUpdateGeneralInfo,
    //
    dashboardFetchUsers,
    dashboardCreateUser,
    dashboardUpdateUser,
    dashboardDeleteUser,
    //
    dashboardFetchVendors,
    dashboardCreateVendor,
    dashboardUpdateVendor,
    dashboardDeleteVendor,
    //
    dashboardFetchOrders,
    dashboardUpdateOrder,
    dashboardDeleteOrder,
    //
    dashboardFetchProducts,
    dashboardCreateProduct,
    dashboardUpdateProduct,
    dashboardDeleteProduct,
}
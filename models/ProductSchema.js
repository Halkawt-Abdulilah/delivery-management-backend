const { object, string, number, } = require('zod');

const ProductSchema = object({
    name: string({
        min: 3,
        max: 255,
        trim: true,
    }),

    description: string({
        min: 10,
        max: 1000,
        trim: true,
    }),

    price: number({
    })
    .positive(),

    prep_time: number().positive(),
});

module.exports = ProductSchema

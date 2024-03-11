const { z } = require('zod');

const roles = ["ADMIN", "VENDOR", "DRIVER", "CUSTOMER", "SUPERADMIN"]

const numberSchema = z.string().min(11).refine((number) => {
    if (isNaN(Number(number)))
        throw new Error('Please provide a proper phone number')
    return true
}, {
    message: 'Invalid Phone Number'
})


const longitudeSchema = z.string().refine((value) => {
    if (isNaN(Number(value)) || value < -180 || value > 180) {
        throw new Error('Invalid longitude: Must be a number between -180 and 180.');
    }
    return true;
}, {
    message: 'Invalid longitude',
});

const latitudeSchema = z.string().refine((value) => {
    if (isNaN(Number(value)) || value < -90 || value > 90) {
        throw new Error('Invalid latitude: Must be a number between -90 and 90.');
    }
    return true;
}, {
    message: 'Invalid latitude',
});

const UserSchema = z.object({
    number: numberSchema,
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    first_name: z.string().min(1, { message: 'invalid first name' }),
    last_name: z.string().min(1, { message: 'invalid last name' }),
    role: z.enum(roles),
})

const UserInfoSchema = z.object({
    first_name: z.string().min(1, { message: 'invalid first name' }).optional(),
    last_name: z.string().min(1, { message: 'invalid last name' }).optional(),
})

module.exports = {
    UserSchema,
    UserInfoSchema,
}
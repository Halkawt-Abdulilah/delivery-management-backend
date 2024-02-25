const { z } = require('zod');

const genders = ["Male", "Female"]
const roles = ["ADMIN", "VENDOR", "DRIVER", "CUSTOMER"]

const numberSchema = z.string().min(11).refine((number) => {
    if (isNaN(Number(number)))
        throw new Error('Please provide a proper phone number')
    return true
}, {
    message: 'Invalid Phone Number'
})

const fullNameSchema = z.string().refine((name) => {
    const parts = name.split(' ');

    // Basic validation: at least first and last name separated by space
    if (parts.length < 2) {
        return false;
    }

    const minPartLength = 2; // Adjust as needed
    if (parts.some((part) => part.length < minPartLength)) {
        return false;
    }

    return true;
}, {
    message: 'Invalid full name. Please provide first and last name separated by spaces, with each part having at least 2 characters',
});

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
    full_name: fullNameSchema,
    role: z.enum(roles),
})

const UserInfoSchema = z.object({
    full_name: fullNameSchema.optional(),
    gender: z.enum(genders).optional(),
    dob: z.date().optional(),
})

module.exports = {
    UserSchema,
    UserInfoSchema,
}
const { z } = require('zod');

const AddressSchema = z.object({
    address: z.string().trim().min(1, 'Address is required'),
    longitude: z.number(),
    latitude: z.number(),
    description: z.string().optional(),
});

module.exports =  AddressSchema;

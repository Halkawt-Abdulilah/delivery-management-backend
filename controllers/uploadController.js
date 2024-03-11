const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2;
const fs = require('fs')


// Vendor
const uploadProductImage = async (req, res) => {

    const fileName = req.files.image.name

    const uploadedProductImage = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: false,
        folder: 'products',
        public_id: `${req.user.vendor_name}_${fileName.split('.')[0]}`,
    });

    fs.unlinkSync(req.files.image.tempFilePath)

    res.status(StatusCodes.OK).json({ url: uploadedProductImage.secure_url })
}

//Admin
const uploadVendorProfile = async (req, res) => {

    const fileName = req.files.image.name

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: false,
        folder: 'vendors',
        public_id: `${fileName.split('.')[0]}_profile`,

    });

    fs.unlinkSync(req.files.image.tempFilePath)

    res.status(StatusCodes.OK).json({ url: result.secure_url })
}

//Admin
const uploadVendorBackground = async (req, res) => {

    const fileName = req.files.image.name

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: false,
        folder: 'vendors',
        public_id: `${fileName.split('.')[0]}_background`,
    });

    fs.unlinkSync(req.files.image.tempFilePath)

    res.status(StatusCodes.OK).json({ url: result.secure_url })
}

const uploadVendorProductImage = async (req, res) => {

    const {id} = req.params
    const fileName = req.files.image.name

    const uploadedProductImage = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: false,
        folder: 'products',
        public_id: `${id}_${fileName.split('.')[0]}`,
    });

    fs.unlinkSync(req.files.image.tempFilePath)

    res.status(StatusCodes.OK).json({ url: uploadedProductImage.secure_url })
}

//Admin
const uploadUserProfile = async (req, res) => {

    const { id } = req.params

    console.log(req.files);

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: false,
        folder: 'profiles',
        public_id: id,
    });

    fs.unlinkSync(req.files.image.tempFilePath)

    res.status(StatusCodes.OK).json({ url: result.secure_url })
}

//User (Customer)
const uploadOwnUserProfile = async (req, res) => {

    const { id } = req.user.user_id

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: false,
        folder: 'profiles',
        public_id: id,
    });

    fs.unlinkSync(req.files.image.tempFilePath)
}

module.exports = {
    uploadProductImage,
    uploadVendorProfile,
    uploadVendorBackground,
    uploadUserProfile,
    uploadOwnUserProfile,
    uploadVendorProductImage,
}
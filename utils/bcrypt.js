const bcrypt = require('bcryptjs')

const encryptInput = async (input) => {
    const salt = await bcrypt.genSalt(10);
    newInput = await bcrypt.hash(input, salt);
    return newInput
}

const compareInput = async (input, hashedInput) => {
    const isMatch = await bcrypt.compare(input, hashedInput)
    return isMatch
}

function generatePin() {
    const randomNumber = Math.floor(Math.random() * 10000);

    const pinString = randomNumber.toString().padStart(4, '0');

    return pinString;
}

module.exports = {
    encryptInput,
    compareInput,
    generatePin
}
const validator = require('validator')

const nameValidator = (name) => {
    return validator.matches(name, /^[a-zA-Z ]+$/)
}

const emailValidator = (email) => {
    return validator.isEmail(email)
}

const passwordValidator = (password) => {
    return password.length < 8
}

module.exports = {
    nameValidator,
    emailValidator,
    passwordValidator,
}
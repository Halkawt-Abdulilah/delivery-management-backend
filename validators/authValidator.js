const {
    nameValidator,
    emailValidator,
    passwordValidator,
} = require('./validator')

const authValidator = ({ first_name, last_name, email, password }) => {

    const errors = {}
    if (!first_name || !nameValidator(first_name)) {
        errors.first_name = "Invalid First Name"
    }

    if (!last_name || !nameValidator(last_name)) {
        errors.last_name = "Invalid Last Name"
    }

    if (!email || !emailValidator(email)) {
        errors.email = "Invalid Email"
    }

    if (!password || passwordValidator(password)) {
        errors.password = "Invalid Password"
    }

    if (!confirmPassword || (password != confirmPassword)) {
        errors.password = "Confirm Password Mismatch"
    }

    return errors;
}

const loginValidator = ({ email, password }) => {
    const errors = {}
    if (!email || !emailValidator(email)) {
        errors.email.push = "Invalid Email"
    }

    if (!password || passwordValidator(password)) {
        errors.password = "Invalid Password"
    }

    return errors;
}

module.exports = {
    authValidator,
    loginValidator
}
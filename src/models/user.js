const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    company: {
        type: String,
    },
    telegramPasscode: {
        type: String,
    },
    cookie: {
        type: String,
    },
    ip: {
        type: String,
    },
    tokens: [
        {
            token: {
                type: String,
                require: true
            }
        }
    ]
})

userSchema.methods.getPublicProfiles = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.pass
    delete userObject.tokens
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

module.exports = mongoose.model('user', userSchema);
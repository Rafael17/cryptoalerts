const jwt = require('jsonwebtoken')
const User = require('../models/user')

const authUser = async (req, res, next) => {
    let token
    try {
        if (req.header('Authorization')) {
            // API authentication
            token = req.header('Authorization').replace('Bearer ', '')
        } else {
            // Browser cookies authentication
            token = req.cookies.token
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    }
    catch (e) {
        res.status(403).json({ message: e })
    }
}

module.exports = authUser
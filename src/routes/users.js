const express = require('express')
const router = express.Router()
const User = require('../models/user')
const mongoose = require('mongoose')
const authUser = require('../middleware/authentication')
const { generateCookie, generateSalt, encryptPassword, validatePassword } = require('./helpers')

/*********************************************\
Middleware
\*********************************************/
/*
const getUser = async (req, res, next) => {
    let user
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'Invalid user id' })
        }

        user = await User.findById(id)
        if (user == null) {
            return res.status(404).json({ message: 'Cant find user' })
        }
    } catch (e) {
        return res.status(500).json({ message: e })
    }

    res.user = user
    next()
}
*/

/*********************************************\
Routes
\*********************************************/

router.post('/session', async (req, res) => {

    const { user, pass } = req.body

    try {
        const sessionUser = await User.findOne({ user })
        if (sessionUser == null) {
            res.status(401).json({ message: 'User or password are invalid' })
            return
        }
        if (!validatePassword(pass, sessionUser.pass)) {
            res.status(401).json({ message: 'User or password are invalid' })
            return
        }

        const token = await sessionUser.generateAuthToken()
        sessionUser.tokens = sessionUser.tokens.concat({ token })
        sessionUser.save()
        //res.cookie('token', token, { maxAge: 900000 })
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/`);
        res.json(sessionUser.getPublicProfiles())

    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

router.delete('/session', authUser, async (req, res) => {
    const { user, token } = req
    try {
        user.tokens = user.tokens.filter(t => !t.token == token)
        await user.save()

        res.clearCookie('token')
        req.session.destroy(() => res.json({ message: 'User has logged out' }))
        //res.json(user)
    } catch (e) {
        res.status(500).json({ message: 'Not able to delete session' })
    }
    //res.clearCookie('login')
    //req.session.destroy(() => res.json({ message: 'User has logged out' }))
})




// for testing only
router.get('/', async (req, res) => {
    try {
        const user = await User.find()
        res.json(user)
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

router.get('/:id', authUser, async (req, res) => {
    if (req.params.id == req.user.id) {
        res.json(req.user.getPublicProfiles())
    } else {
        res.status(404).json()
    }
})

router.patch('/:id', authUser, async (req, res) => {
    if (req.params.id == req.user.id) {
        res.json(req.user.getPublicProfiles())
    } else {
        res.status(404).json()
    }
})

router.delete('/:id', authUser, async (req, res) => {
    try {
        await res.user.remove()
        res.json({ message: 'Deleted this user' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/', async (req, res) => {
    const { email, pass, user } = req.body
    const newUser = new User({
        email: email,
        pass: encryptPassword(pass),
        user: user,
        telegramPasscode: generateSalt(6).toUpperCase()
    })

    try {
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

module.exports = router

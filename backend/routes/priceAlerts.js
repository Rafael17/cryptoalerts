const express = require('express')
const router = express.Router()
const PriceAlert = require('../models/priceAlert')
const mongoose = require('mongoose')
const { generateCookie, generateSalt, encryptPassword, validatePassword } = require('./helpers')
const authUser = require('../middleware/authentication')

/*********************************************\
Middleware
\*********************************************/
// fix this for exchange aggregator, need to bypass
router.get('/', async (req, res) => {
    const { userId } = req.query
    try {
        const find = { ...req.query }
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                res.status(422).json({ message: 'Invalid user id' })
                return;
            }
        }
        const priceAlerts = await PriceAlert.find(find)
        res.json(priceAlerts)
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

router.get('/:id/', authUser, async (req, res) => {
    try {
        const priceAlerts = await PriceAlert.findById(req.params.id)
        if (priceAlerts == null) {
            res.status(404).json({ message: 'Price alert does not exist' })
        }
        else {
            res.json(priceAlerts)
        }
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

router.post('/', authUser, async (req, res) => {
    const { price, exchange, pair, cross, message, userId } = req.body
    if (userId != req.user._id || req.user.isAdmin) {
        res.status(403).json({ message: 'Trying to create an alert for another user' })
        return
    }
    try {
        const newPriceAlerts = new PriceAlert({
            userId,
            price,
            exchange,
            pair,
            cross,
            message,
            status: ''
        })
        const savedPriceAlerts = await newPriceAlerts.save()
        res.status(201).json(savedPriceAlerts)
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

router.delete('/:id/', authUser, async (req, res) => {
    const { id } = req.params
    try {
        const deletedPriceAlerts = await PriceAlert.findById(id)
        if (!deletedPriceAlerts) {
            res.status(404).json({ message: 'Price does not exist' })
            return
        }
        if (deletedPriceAlerts.userId.toString() != req.user._id || req.user.isAdmin) {
            res.status(403).json({ message: 'Trying to delete an alert for another user' })
            return
        }
        const result = await deletedPriceAlerts.deleteOne()
        res.json({ message: 'Deleted price alert' })
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

router.patch('/:id/', async (req, res) => {
    const { id } = req.params
    try {
        const updatedPriceAlerts = await PriceAlert.findById(id)
        if (!updatedPriceAlerts) {
            res.status(404).json({ message: 'Price does not exist' })
            return
        }
        /*
        if (updatedPriceAlerts.userId.toString() != req.user._id || req.user.isAdmin) {
            res.status(403).json({ message: 'Trying to delete an alert for another user' })
            return
        }
        */

        //TRIGGERED - notify telegram
        if (req.body.status) {
            updatedPriceAlerts.status = req.body.status
        }
        await updatedPriceAlerts.save()
        res.json({ message: 'Price alert updated' })
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

module.exports = router

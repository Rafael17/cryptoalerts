const express = require('express')
const router = express.Router()
const IndicatorAlert = require('../models/indicatorAlert')
const mongoose = require('mongoose')
const { generateCookie, generateSalt, encryptPassword, validatePassword } = require('./helpers')
const authUser = require('../middleware/authentication')

/*********************************************\
Middleware
\*********************************************/

router.get('/', authUser, async (req, res) => {
    const { userId } = req.query
    try {
        const find = {};
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                res.status(422).json({ message: 'Invalid user id' })
                return;
            }
            find.userId = userId;
        }
        const indicatorAlerts = await IndicatorAlert.find(find)
        if (indicatorAlerts.length === 0) {
            res.status(404).json({ message: 'No indicator indicators found' })
        }
        else {
            res.json(indicatorAlerts)
        }
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

router.get('/:id/', authUser, async (req, res) => {
    try {
        const indicatorAlerts = await IndicatorAlert.findById(req.params.id)
        if (indicatorAlerts == null) {
            res.status(404).json({ message: 'Price indicator does not exist' })
        }
        else {
            res.json(indicatorAlerts)
        }
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

router.post('/', authUser, async (req, res) => {
    const { price, exchange, pair, timeframe_1, timeframe_5, timeframe_15, timeframe_60, timeframe_240, userId } = req.body
    if (userId != req.user._id || req.user.isAdmin) {
        res.status(403).json({ message: 'Trying to create an indicator for another user' })
        return
    }
    try {
        const newIndicatorAlerts = new IndicatorAlert({
            userId,
            price,
            exchange,
            pair,
            timeframe_1,
            timeframe_5,
            timeframe_15,
            timeframe_60,
            timeframe_240
        })
        const savedIndicatorAlerts = await newIndicatorAlerts.save()
        res.json(savedIndicatorAlerts)
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

router.delete('/:id/', authUser, async (req, res) => {
    const { id } = req.params
    try {
        const deletedIndicatorAlerts = await IndicatorAlert.findById(id)
        if (!deletedIndicatorAlerts) {
            res.status(404).json({ message: 'Price does not exist' })
            return
        }
        if (deletedIndicatorAlerts.userId.toString() != req.user._id || req.user.isAdmin) {
            res.status(403).json({ message: 'Trying to delete an indicator for another user' })
            return
        }
        const result = await deletedIndicatorAlerts.deleteOne()
        res.json({ message: 'Deleted price indicator' })
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

module.exports = router

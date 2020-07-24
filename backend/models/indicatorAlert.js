const mongoose = require('mongoose');

const indicatorAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    exchange: {
        type: String,
        required: true
    },
    indicator: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    pair: {
        type: String,
    },
    timeframe_1: {
        type: Boolean
    },
    timeframe_5: {
        type: Boolean
    },
    timeframe_15: {
        type: Boolean
    },
    timeframe_60: {
        type: Boolean
    },
    timeframe_240: {
        type: Boolean
    }
})

module.exports = mongoose.model('indicatorAlert', indicatorAlertSchema);

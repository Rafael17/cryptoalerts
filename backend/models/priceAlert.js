const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    exchange: {
        type: String,
        required: true
    },
    price: {
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
    cross: {
        type: String,
    },
    message: {
        type: String,
    },
    status: {
        type: String,
        enum: ['', 'TRIGGERED', 'NOTIFIED', 'DELETED'],
        default: ''
    }
})

module.exports = mongoose.model('priceAlert', priceAlertSchema);

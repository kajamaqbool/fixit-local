const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

    status: {
        type: String,
        enum: ['requested', 'accepted', 'in-progress', 'completed', 'cancelled'],
        default: 'requested'
    },

    requestedAt: { type: Date, default: Date.now },
    respondedAt: Date,   // when provider accepted/rejected — used for response time
    completedAt: Date,

    rating: { type: Number, min: 1, max: 5 },
    review: String

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'provider'],
        required: true
    },
    phone: String,
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    category: String,
    bio: String,

    completeBookings: { type: Number, default: 0 },
    cancelBookings: { type: Number, default: 0 },
    totalResponseTimeMins: { type: Number, default: 0 },
    responseCount: { type: Number, default: 0 },
    repeatCustomers: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    trustScore: { type: Number, default: 50 }

}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
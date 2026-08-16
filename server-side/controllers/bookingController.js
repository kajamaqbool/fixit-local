const Booking = require('../models/Booking');
const User = require('../models/User');
const calculateTrustScore = require('../utils/trustScore');
exports.createBooking = async (req, res) => {
    try {
        const { providerId, serviceId } = req.body;
        const booking = await Booking.create({
            customer: req.user.id,
            provider: providerId,
            service: serviceId
        });
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Provider accepts/rejects — records response time
exports.respondToBooking = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'cancelled'
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = status;
        booking.respondedAt = new Date();
        await booking.save();

        const responseMins = (booking.respondedAt - booking.requestedAt) / 60000;
        const provider = await User.findById(booking.provider);
        provider.totalResponseTimeMins += responseMins;
        provider.responseCount += 1;

        if (status === 'cancelled') provider.cancelBookings += 1;

        provider.trustScore = calculateTrustScore(provider);
        await provider.save();

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Customer marks complete + rates
exports.completeBooking = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = 'completed';
        booking.completedAt = new Date();
        booking.rating = rating;
        booking.review = review;
        await booking.save();

        const provider = await User.findById(booking.provider);
        provider.completeBookings += 1;
        provider.ratingSum += rating;
        provider.ratingCount += 1;

        // Check if this customer has booked this provider before
        const priorCount = await Booking.countDocuments({
            customer: booking.customer,
            provider: booking.provider,
            status: 'completed'
        });
        if (priorCount > 1) provider.repeatCustomers += 1;

        provider.trustScore = calculateTrustScore(provider);
        await provider.save();

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name')
            .populate('provider', 'name trustScore')
            .populate('service', 'title category');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const isParticipant =
            booking.customer._id.toString() === req.user.id ||
            booking.provider._id.toString() === req.user.id;

        if (!isParticipant) return res.status(403).json({ message: 'Access denied' });

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const filter = req.user.role === 'customer'
            ? { customer: req.user.id }
            : { provider: req.user.id };

        const bookings = await Booking.find(filter)
            .populate('customer', 'name')
            .populate('provider', 'name trustScore')
            .populate('service', 'title category')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
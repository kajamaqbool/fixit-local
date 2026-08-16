const Message = require('../models/Message');
const Booking = require('../models/Booking');

exports.getMessages = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const isParticipant =
            booking.customer.toString() === req.user.id ||
            booking.provider.toString() === req.user.id;
        if (!isParticipant) return res.status(403).json({ message: 'Access denied' });

        const messages = await Message.find({ booking: bookingId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
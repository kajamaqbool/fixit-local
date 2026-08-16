const express = require('express');
const {
    createBooking,
    respondToBooking,
    completeBooking,
    getBookingById,
    getMyBookings
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');
const { getMessages } = require('../controllers/messageController');
const router = express.Router();

router.get('/my-bookings', protect, getMyBookings);         // specific route FIRST
router.post('/', protect, restrictTo('customer'), createBooking);
router.patch('/:id/respond', protect, restrictTo('provider'), respondToBooking);
router.patch('/:id/complete', protect, restrictTo('customer'), completeBooking);
router.get('/:id', protect, getBookingById);                // wildcard route LAST
router.get('/:id/messages', protect, getMessages);
module.exports = router;
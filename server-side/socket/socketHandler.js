const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

function initSocket(io) {
    // Authenticate every socket connection using the JWT
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('No token provided'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // { id, role }
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.id} (${socket.user.role})`);

        // --- CHAT ---
        // Each booking gets its own "room" so messages stay scoped to that conversation
        socket.on('joinBookingRoom', (bookingId) => {
            socket.join(`booking:${bookingId}`);
        });

        socket.on('sendMessage', ({ bookingId, text }) => {
            const message = {
                senderId: socket.user.id,
                senderRole: socket.user.role,
                text,
                timestamp: new Date()
            };
            socket.to(`booking:${bookingId}`).emit('newMessage', message);  // ← changed from io.to(...)
        });

        // --- LIVE PROVIDER TRACKING ---
        socket.on('updateLocation', ({ bookingId, lat, lng }) => {
            if (socket.user.role !== 'provider') return; // only providers broadcast location
            io.to(`booking:${bookingId}`).emit('providerLocation', { lat, lng });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.id}`);
        });

        //const Message = require('../models/Message');

        // inside io.on('connection', (socket) => { ... })

        socket.on('sendMessage', async ({ bookingId, text }) => {
            try {
                const saved = await Message.create({
                    booking: bookingId,
                    sender: socket.user.id,
                    senderRole: socket.user.role,
                    text
                });

                const message = {
                    senderId: socket.user.id,
                    senderRole: socket.user.role,
                    text,
                    timestamp: saved.createdAt
                };

                socket.to(`booking:${bookingId}`).emit('newMessage', message);
            } catch (err) {
                console.error('Failed to save message:', err.message);
            }
        });

    });
}

module.exports = initSocket;
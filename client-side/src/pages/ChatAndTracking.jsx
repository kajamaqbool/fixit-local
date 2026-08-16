import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { getSocket } from '../api/socket';
import { useAuth } from '../context/AuthContext';

export default function ChatAndTracking() {
    const { bookingId } = useParams();
    const { user } = useAuth();

    const [booking, setBooking] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [location, setLocation] = useState(null);
    const [sharingLocation, setSharingLocation] = useState(false);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [showRatingForm, setShowRatingForm] = useState(false);

    const socketRef = useRef(null);
    const watchIdRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const { data } = await api.get(`/bookings/${bookingId}`);
                setBooking(data);
            } catch (err) {
                setError('Could not load booking.');
            }
        };
        fetchBooking();
    }, [bookingId]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/bookings/${bookingId}/messages`);
                setMessages(data.map(m => ({
                    senderId: m.sender,
                    senderRole: m.senderRole,
                    text: m.text
                })));
            } catch (err) {
                console.error('Could not load message history');
            }
        };
        fetchMessages();
    }, [bookingId]);

    useEffect(() => {
        const socket = getSocket();
        socketRef.current = socket;
        socket.emit('joinBookingRoom', bookingId);

        socket.on('newMessage', (msg) => setMessages((prev) => [...prev, msg]));
        socket.on('providerLocation', (loc) => setLocation(loc));

        return () => {
            socket.off('newMessage');
            socket.off('providerLocation');
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [bookingId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        socketRef.current.emit('sendMessage', { bookingId, text });
        setMessages((prev) => [...prev, { senderId: user.id, senderRole: user.role, text }]);
        setText('');
    };

    const respondToBooking = async (status) => {
        try {
            const { data } = await api.patch(`/bookings/${bookingId}/respond`, { status });
            setBooking((prev) => ({ ...prev, status: data.status }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking');
        }
    };

    const completeBooking = async () => {
        try {
            const { data } = await api.patch(`/bookings/${bookingId}/complete`, { rating, review });
            setBooking((prev) => ({ ...prev, status: data.status }));
            setShowRatingForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete booking');
        }
    };

    const toggleLocationSharing = () => {
        if (sharingLocation) {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            setSharingLocation(false);
            return;
        }
        if (!navigator.geolocation) {
            setError('Geolocation not supported by this browser.');
            return;
        }
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                socketRef.current.emit('updateLocation', { bookingId, lat: latitude, lng: longitude });
                setLocation({ lat: latitude, lng: longitude });
            },
            (err) => setError('Location error: ' + err.message),
            { enableHighAccuracy: true, maximumAge: 5000 }
        );
        setSharingLocation(true);
    };

    if (!booking) return <p style={{ textAlign: 'center', marginTop: 60 }}>{error || 'Loading...'}</p>;

    const otherParty = user.role === 'customer' ? booking.provider : booking.customer;

    return (
        <div style={{ maxWidth: 600, margin: '30px auto' }}>
            <h2>{booking.service?.title}</h2>
            <p style={{ color: '#555' }}>
                Chatting with {otherParty?.name} — status: <strong>{booking.status}</strong>
            </p>

            {user.role === 'provider' && (
                <button onClick={toggleLocationSharing} style={{ marginBottom: 16 }}>
                    {sharingLocation ? 'Stop sharing location' : 'Start sharing live location'}
                </button>
            )}

            {location && (
                <div style={{ marginBottom: 16, padding: 12, background: '#f0f7ff', borderRadius: 8 }}>
                    <p style={{ margin: 0 }}>
                        📍 {user.role === 'provider' ? 'Your location' : "Provider's location"}: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                    <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noreferrer">
                        View on Google Maps
                    </a>
                </div>
            )}

            <div style={{
                border: '1px solid #ddd', borderRadius: 8, height: 300, overflowY: 'auto',
                padding: 12, marginBottom: 12, display: 'flex', flexDirection: 'column'
            }}>
                {messages.length === 0 && <p style={{ color: '#999' }}>No messages yet.</p>}
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                        background: msg.senderId === user.id ? '#0084ff' : '#e5e5ea',
                        color: msg.senderId === user.id ? '#fff' : '#000',
                        borderRadius: 16, padding: '8px 14px', margin: '4px 0', maxWidth: '70%'
                    }}>
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." style={{ flex: 1 }} />
                <button type="submit">Send</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Provider: accept/reject a pending request */}
            {user.role === 'provider' && booking.status === 'requested' && (
                <div style={{ marginBottom: 16 }}>
                    <button onClick={() => respondToBooking('accepted')} style={{ marginRight: 8 }}>
                        Accept
                    </button>
                    <button onClick={() => respondToBooking('cancelled')}>
                        Reject
                    </button>
                </div>
            )}

            {/* Customer: mark complete + rate, once accepted */}
            {user.role === 'customer' && booking.status === 'accepted' && !showRatingForm && (
                <button onClick={() => setShowRatingForm(true)} style={{ marginBottom: 16 }}>
                    Mark as completed
                </button>
            )}

            {showRatingForm && (
                <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <label>Rating: </label>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
                    </select>
                    <br /><br />
                    <textarea
                        placeholder="Leave a review (optional)"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        style={{ width: '100%', minHeight: 60 }}
                    />
                    <br /><br />
                    <button onClick={completeBooking}>Submit & complete</button>
                </div>
            )}

            {booking.status === 'completed' && (
                <p style={{ color: 'green' }}>✅ This booking is completed.</p>
            )}
            {booking.status === 'cancelled' && (
                <p style={{ color: 'red' }}>❌ This booking was cancelled.</p>
            )}

        </div>
    );
}
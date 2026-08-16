import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function MyBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/bookings/my-bookings');
                setBookings(data);
            } catch (err) {
                setError('Could not load bookings.');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const statusColor = (status) => {
        switch (status) {
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            case 'in-progress': return 'orange';
            default: return '#888';
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: 60 }}>Loading...</p>;

    return (
        <div style={{ maxWidth: 650, margin: '40px auto' }}>
            <h2>My Bookings</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {bookings.length === 0 && <p>No bookings yet.</p>}

            {bookings.map((b) => {
                const otherParty = user.role === 'customer' ? b.provider : b.customer;
                return (
                    <div
                        key={b._id}
                        style={{
                            border: '1px solid #ddd', borderRadius: 8, padding: 16,
                            marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                    >
                        <div>
                            <h3 style={{ margin: 0 }}>{b.service?.title}</h3>
                            <p style={{ margin: '4px 0', color: '#555' }}>
                                {user.role === 'customer' ? 'Provider' : 'Customer'}: {otherParty?.name}
                            </p>
                            <p style={{ margin: '4px 0' }}>
                                Status: <span style={{ color: statusColor(b.status), fontWeight: 'bold' }}>{b.status}</span>
                            </p>
                        </div>
                        <Link to={`/chat/${b._id}`}>
                            <button>Open chat</button>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
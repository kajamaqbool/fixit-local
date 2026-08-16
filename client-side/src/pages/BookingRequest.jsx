import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function BookingRequest() {
    const { serviceId } = useParams();
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const { data } = await api.get(`/services/${serviceId}`);
                setService(data);
            } catch (err) {
                setError('Could not load this service.');
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [serviceId]);

    const handleConfirm = async () => {
        setSubmitting(true);
        setError('');
        try {
            const { data } = await api.post('/bookings', {
                serviceId: service._id,
                providerId: service.provider._id
            });
            setSuccess(true);
            // Redirect to a bookings/chat screen once built — for now, go to dashboard
            setTimeout(() => navigate(`/chat/${data._id}`), 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: 60 }}>Loading...</p>;
    if (error && !service) return <p style={{ color: 'red', textAlign: 'center', marginTop: 60 }}>{error}</p>;

    return (
        <div style={{ maxWidth: 500, margin: '60px auto' }}>
            <h2>Confirm booking</h2>

            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>{service.title}</h3>
                <p style={{ color: '#555', margin: '8px 0' }}>{service.category}</p>
                <p style={{ margin: '4px 0' }}>Provider: {service.provider?.name}</p>
                <p style={{ margin: '4px 0' }}>Trust score: {service.provider?.trustScore}</p>
                {service.priceEstimate && <p style={{ margin: '4px 0' }}>Est. price: ₹{service.priceEstimate}</p>}
            </div>

            {success ? (
                <p style={{ color: 'green' }}>Booking requested! Redirecting...</p>
            ) : (
                <>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <button onClick={handleConfirm} disabled={submitting}>
                        {submitting ? 'Requesting...' : 'Confirm booking request'}
                    </button>
                </>
            )}
        </div>
    );
}
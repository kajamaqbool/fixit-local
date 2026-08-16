import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ServiceSearch() {
    const [services, setServices] = useState([]);
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchServices = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/services', {
                params: category ? { category } : {}
            });
            setServices(data);
        } catch (err) {
            setError('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchServices();
    };

    const trustColor = (score) => {
        if (score >= 75) return 'green';
        if (score >= 50) return 'orange';
        return 'red';
    };

    return (
        <div style={{ maxWidth: 700, margin: '40px auto' }}>
            <h2>Find a service</h2>

            <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
                <input
                    placeholder="Category (e.g. plumbing, tutoring)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <button type="submit" style={{ marginLeft: 8 }}>Search</button>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && services.length === 0 && <p>No services found.</p>}

            {services.map((service) => (
                <div
                    key={service._id}
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0 }}>{service.title}</h3>
                        <p style={{ margin: '4px 0', color: '#555' }}>{service.category}</p>
                        <p style={{ margin: '4px 0' }}>
                            By {service.provider?.name || 'Unknown provider'} —{' '}
                            <span style={{ color: trustColor(service.provider?.trustScore), fontWeight: 'bold' }}>
                                Trust score: {service.provider?.trustScore ?? 'N/A'}
                            </span>
                        </p>
                        {service.priceEstimate && <p style={{ margin: '4px 0' }}>Est. ₹{service.priceEstimate}</p>}
                    </div>
                    <button onClick={() => navigate(`/book/${service._id}`)}>
                        Book
                    </button>
                </div>
            ))}
        </div>
    );
}
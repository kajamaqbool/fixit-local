import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/auth/login', form);
            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '60px auto' }}>
            <h2>Log in</h2>
            <form onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required /><br /><br />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required /><br /><br />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Log in</button>
            </form>
            <p>No account? <Link to="/register">Register</Link></p>
        </div>
    );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'customer', category: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/auth/register', form);
            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '60px auto' }}>
            <h2>Create an account</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" onChange={handleChange} required /><br /><br />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required /><br /><br />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required /><br /><br />

                <label>I am a: </label>
                <select name="role" onChange={handleChange} value={form.role}>
                    <option value="customer">Customer</option>
                    <option value="provider">Provider</option>
                </select><br /><br />

                {form.role === 'provider' && (
                    <>
                        <input name="category" placeholder="Service category (e.g. plumbing)" onChange={handleChange} /><br /><br />
                    </>
                )}

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
    );
}
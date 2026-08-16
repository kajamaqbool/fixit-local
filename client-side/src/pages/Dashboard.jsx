import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
<Link to="/services">Browse services</Link>

export default function Dashboard() {
    const { user, logout } = useAuth();
    return (
        <div style={{ maxWidth: 600, margin: '60px auto' }}>
            <h2>Welcome, {user?.name}</h2>
            <p>Role: {user?.role}</p>
            <button onClick={logout}>Log out</button>
            <br /><br />
            <Link to="/my-bookings">My Bookings</Link>
        </div>
    );
}
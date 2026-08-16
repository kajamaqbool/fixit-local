import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ServiceSearch from './pages/ServiceSearch';
import BookingRequest from './pages/BookingRequest';
import ChatAndTracking from './pages/ChatAndTracking';
import MyBookings from './pages/MyBookings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path='/services' element={<ProtectedRoute><ServiceSearch /></ProtectedRoute>} />
          <Route path="/book/:serviceId" element={<ProtectedRoute><BookingRequest /></ProtectedRoute>} />
          <Route path="/chat/:bookingId" element={<ProtectedRoute><ChatAndTracking /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import './index.css';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Shared pages
import Login from './pages/shared/Login';
import Register from './pages/shared/Register';
import RegisterPassenger from './pages/shared/RegisterPassenger';
import RegisterDriver from './pages/shared/RegisterDriver';
import OTPVerify from './pages/shared/OTPVerify';
import NotFound from './pages/shared/NotFound';

// Passenger pages
import PassengerHome from './pages/passenger/Home';
import RequestRide from './pages/passenger/RequestRide';
import Bookings from './pages/passenger/Bookings';
import BookingDetail from './pages/passenger/BookingDetail';
import InterestPage from './pages/passenger/InterestPage';
import MakePayment from './pages/passenger/MakePayment';
import Feedback from './pages/passenger/Feedback';
import PassengerProfile from './pages/passenger/Profile';

// Driver pages
import DriverHome from './pages/driver/Home';
import ViewRequests from './pages/driver/ViewRequests';
import DriverBookings from './pages/driver/DriverBookings';
import RideActive from './pages/driver/RideActive';
import DriverProfile from './pages/driver/Profile';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Passengers from './pages/admin/Passengers';
import Drivers from './pages/admin/Drivers';
import AdminRides from './pages/admin/Rides';
import AdminBookings from './pages/admin/AdminBookings';
import Reports from './pages/admin/Reports';

const RoleRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'passenger') return <Navigate to="/passenger/home" />;
  if (user.role === 'driver') return <Navigate to="/driver/home" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  return <Navigate to="/login" />;
};

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-surface-50">
        <Navbar />
        <main className="flex-1 relative">
          <Routes>
            {/* Public */}
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/passenger" element={<RegisterPassenger />} />
            <Route path="/register/driver" element={<RegisterDriver />} />
            <Route path="/verify-otp" element={<OTPVerify />} />

            {/* Passenger */}
            <Route path="/passenger/home" element={<ProtectedRoute allowedRoles={['passenger']}><PassengerHome /></ProtectedRoute>} />
            <Route path="/passenger/request-ride" element={<ProtectedRoute allowedRoles={['passenger']}><RequestRide /></ProtectedRoute>} />
            <Route path="/passenger/bookings" element={<ProtectedRoute allowedRoles={['passenger']}><Bookings /></ProtectedRoute>} />
            <Route path="/passenger/bookings/:id" element={<ProtectedRoute allowedRoles={['passenger']}><BookingDetail /></ProtectedRoute>} />
            <Route path="/passenger/interests/:rideId" element={<ProtectedRoute allowedRoles={['passenger']}><InterestPage /></ProtectedRoute>} />
            <Route path="/passenger/payment/:bookingId" element={<ProtectedRoute allowedRoles={['passenger']}><MakePayment /></ProtectedRoute>} />
            <Route path="/passenger/feedback/:bookingId" element={<ProtectedRoute allowedRoles={['passenger']}><Feedback /></ProtectedRoute>} />
            <Route path="/passenger/profile" element={<ProtectedRoute allowedRoles={['passenger']}><PassengerProfile /></ProtectedRoute>} />

            {/* Driver */}
            <Route path="/driver/home" element={<ProtectedRoute allowedRoles={['driver']}><DriverHome /></ProtectedRoute>} />
            <Route path="/driver/requests" element={<ProtectedRoute allowedRoles={['driver']}><ViewRequests /></ProtectedRoute>} />
            <Route path="/driver/bookings" element={<ProtectedRoute allowedRoles={['driver']}><DriverBookings /></ProtectedRoute>} />
            <Route path="/driver/ride/:bookingId" element={<ProtectedRoute allowedRoles={['driver']}><RideActive /></ProtectedRoute>} />
            <Route path="/driver/profile" element={<ProtectedRoute allowedRoles={['driver']}><DriverProfile /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/passengers" element={<ProtectedRoute allowedRoles={['admin']}><Passengers /></ProtectedRoute>} />
            <Route path="/admin/drivers" element={<ProtectedRoute allowedRoles={['admin']}><Drivers /></ProtectedRoute>} />
            <Route path="/admin/rides" element={<ProtectedRoute allowedRoles={['admin']}><AdminRides /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#FFFFFF',
            color: '#23213A',
            boxShadow: '0 4px 12px rgba(91,33,182,0.08), 0 12px 32px rgba(91,33,182,0.08)',
            border: '1px solid #E4E1F0',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: '"Inter", system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: '#059669', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  </Provider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

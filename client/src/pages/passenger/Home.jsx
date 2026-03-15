import { Link } from 'react-router-dom';
import { MapPin, Plus, List, User } from 'lucide-react';
import { useGetMyBookingsQuery, useGetMyRideRequestsQuery } from '../../features/rides/ridesApi';
import { useAuth } from '../../hooks/useAuth';
import BookingCard from '../../components/passenger/BookingCard';
import Loader from '../../components/common/Loader';

const PassengerHome = () => {
  const { user } = useAuth();
  const { data: bookings, isLoading: loadingBookings } = useGetMyBookingsQuery();
  const { data: rides, isLoading: loadingRides } = useGetMyRideRequestsQuery();

  const activeBookings = bookings?.filter(
    (b) => b.rideStatus === 'Ride Booked' || b.rideStatus === 'In Progress'
  ) || [];

  const openRides = rides?.filter((r) => r.status === 'Open') || [];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">Welcome, {user?.name}</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/passenger/request-ride" className="card-interactive text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto mb-3">
            <Plus className="w-5 h-5 text-primary-600" />
          </div>
          <span className="text-sm font-semibold text-surface-800">New Ride</span>
        </Link>
        <Link to="/passenger/bookings" className="card-interactive text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto mb-3">
            <List className="w-5 h-5 text-primary-600" />
          </div>
          <span className="text-sm font-semibold text-surface-800">My Bookings</span>
        </Link>
        <Link to="/passenger/profile" className="card-interactive text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto mb-3">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <span className="text-sm font-semibold text-surface-800">Profile</span>
        </Link>
        <div className="card text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-5 h-5 text-primary-600" />
          </div>
          <span className="text-sm font-semibold text-surface-800">{openRides.length} Open Rides</span>
        </div>
      </div>

      {/* Active Bookings */}
      <h2 className="section-title">Active Bookings</h2>
      {loadingBookings ? (
        <Loader />
      ) : activeBookings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeBookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-surface-400">No active bookings.</p>
          <Link to="/passenger/request-ride" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors text-sm mt-2 inline-block">
            Request a ride
          </Link>
        </div>
      )}
    </div>
  );
};

export default PassengerHome;

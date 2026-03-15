import { Link } from 'react-router-dom';
import { Car, List, Search, User } from 'lucide-react';
import { useGetDriverBookingsQuery, useGetMyVehicleQuery } from '../../features/rides/ridesApi';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import RideStatusPanel from '../../components/driver/RideStatusPanel';
import { formatDateTime, formatCurrency } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../utils/constants';
import { MapPin } from 'lucide-react';

const DriverHome = () => {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useGetDriverBookingsQuery();
  const { data: vehicle } = useGetMyVehicleQuery();

  const activeBookings = bookings?.filter(
    (b) => b.rideStatus === 'Ride Booked' || b.rideStatus === 'In Progress'
  ) || [];

  const completedCount = bookings?.filter((b) => b.rideStatus === 'Ride Completed').length || 0;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">Welcome, {user?.name}</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/driver/requests" className="card-interactive text-center">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center mx-auto mb-2">
            <Search className="w-5 h-5 text-primary-600" />
          </div>
          <span className="text-sm font-medium text-surface-800">Browse Rides</span>
        </Link>
        <Link to="/driver/bookings" className="card-interactive text-center">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mx-auto mb-2">
            <List className="w-5 h-5 text-primary-600" />
          </div>
          <span className="text-sm font-medium text-surface-800">My Bookings</span>
        </Link>
        <Link to="/driver/profile" className="card-interactive text-center">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mx-auto mb-2">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <span className="text-sm font-medium text-surface-800">Profile</span>
        </Link>
        <div className="card text-center">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mx-auto mb-2">
            <Car className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-surface-800">{completedCount} Completed</span>
        </div>
      </div>

      {/* Vehicle Info */}
      {vehicle && (
        <div className="card mb-6 border-l-4 border-primary-400">
          <h2 className="section-title">Your Vehicle</h2>
          <p className="text-sm text-surface-500">
            {vehicle.companyName} {vehicle.model} &mdash; {vehicle.vehicleNumber} &mdash; {vehicle.fuelType?.fuelType}
          </p>
        </div>
      )}

      {!vehicle && (
        <div className="card mb-6 text-center text-surface-400">
          <p>No vehicle registered.</p>
          <p className="text-sm mt-1">You need a vehicle to express interest in rides.</p>
        </div>
      )}

      {/* Active Bookings */}
      <h2 className="section-title mb-4">Active Bookings</h2>
      {isLoading ? (
        <Loader />
      ) : activeBookings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {activeBookings.map((booking) => {
            const ride = booking.interest?.rideRequest;
            return (
              <div key={booking._id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <span className={`badge ${STATUS_COLORS[booking.rideStatus]}`}>
                    {booking.rideStatus}
                  </span>
                  <span className="text-lg font-bold text-primary-600">{formatCurrency(booking.interest?.estimatedCost)}</span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-surface-600">{ride?.sourceAddress}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-surface-600">{ride?.destinationAddress}</span>
                  </div>
                </div>
                <p className="text-xs text-surface-400 mb-3">Passenger: {ride?.passenger?.fname} {ride?.passenger?.lname}</p>
                <RideStatusPanel booking={booking} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-surface-400 py-12 text-center">No active bookings.</div>
      )}
    </div>
  );
};

export default DriverHome;

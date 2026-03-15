import { useParams } from 'react-router-dom';
import { useGetBookingQuery } from '../../features/rides/ridesApi';
import Loader from '../../components/common/Loader';
import RideStatusPanel from '../../components/driver/RideStatusPanel';
import RouteDisplay from '../../components/maps/RouteDisplay';
import { formatDateTime, formatCurrency } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../utils/constants';
import { MapPin, Calendar, User } from 'lucide-react';

const RideActive = () => {
  const { bookingId } = useParams();
  const { data: booking, isLoading } = useGetBookingQuery(bookingId);

  if (isLoading) return <Loader />;
  if (!booking) return <div className="text-surface-400 py-12 text-center">Booking not found.</div>;

  const ride = booking.interest?.rideRequest;
  const passenger = ride?.passenger;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title !mb-0">Active Ride</h1>
        <span className={`badge ${STATUS_COLORS[booking.rideStatus]}`}>
          {booking.rideStatus}
        </span>
      </div>

      <div className="card mb-4">
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
            <span className="text-sm text-surface-600">{ride?.sourceAddress}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
            <span className="text-sm text-surface-600">{ride?.destinationAddress}</span>
          </div>
        </div>

        {ride?.sourceCoords && ride?.destinationCoords && (
          <RouteDisplay
            sourceCoords={ride.sourceCoords}
            destinationCoords={ride.destinationCoords}
            sourceAddress={ride.sourceAddress}
            destinationAddress={ride.destinationAddress}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card">
          <h3 className="section-title flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Schedule
          </h3>
          <p className="text-sm text-surface-600">From: {formatDateTime(ride?.fromDateTime)}</p>
          <p className="text-sm text-surface-600">To: {formatDateTime(ride?.toDateTime)}</p>
          <p className="text-lg font-bold text-primary-600 mt-2">{formatCurrency(booking.interest?.estimatedCost)}</p>
        </div>
        <div className="card">
          <h3 className="section-title flex items-center gap-2">
            <User className="w-4 h-4" /> Passenger
          </h3>
          <p className="text-sm text-surface-800">{passenger?.fname} {passenger?.lname}</p>
          <p className="text-sm text-surface-400">{passenger?.email}</p>
          <p className="text-sm text-surface-400">{passenger?.contact}</p>
          <p className="text-sm text-surface-400 mt-1">Passengers: {ride?.passengerCount}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-3">Actions</h3>
        <RideStatusPanel booking={booking} />
      </div>
    </div>
  );
};

export default RideActive;

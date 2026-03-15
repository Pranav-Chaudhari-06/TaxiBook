import { Link } from 'react-router-dom';
import { MapPin, Calendar, Car } from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../utils/constants';

const BookingCard = ({ booking }) => {
  const ride = booking.interest?.rideRequest;
  const vehicle = booking.interest?.vehicle;
  const driver = vehicle?.driver;

  return (
    <div className="card-hover">
      <div className="flex justify-between items-start mb-3">
        <span className={`badge ${STATUS_COLORS[booking.rideStatus] || 'bg-surface-100 text-surface-600'}`}>
          {booking.rideStatus}
        </span>
        <span className="text-lg font-bold text-primary-600">{formatCurrency(booking.interest?.estimatedCost)}</span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
          <span className="text-sm text-surface-600">{ride?.sourceAddress || 'N/A'}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <span className="text-sm text-surface-600">{ride?.destinationAddress || 'N/A'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-surface-400 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDateTime(ride?.fromDateTime)}</span>
        </div>
        {driver && (
          <div className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            <span>{driver.fname} {driver.lname}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/passenger/bookings/${booking._id}`} className="btn-primary text-sm">
          View Details
        </Link>
        {booking.rideStatus === 'Ride Completed' && (
          <Link to={`/passenger/payment/${booking._id}`} className="btn-success text-sm">
            Payment
          </Link>
        )}
      </div>
    </div>
  );
};

export default BookingCard;

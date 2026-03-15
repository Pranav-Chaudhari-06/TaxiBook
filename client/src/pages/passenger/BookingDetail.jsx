import { useParams, Link } from 'react-router-dom';
import { useGetBookingQuery, useGetPaymentByBookingQuery, useGetFeedbackByBookingQuery, useCancelBookingMutation } from '../../features/rides/ridesApi';
import Loader from '../../components/common/Loader';
import RouteDisplay from '../../components/maps/RouteDisplay';
import { formatDateTime, formatCurrency } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../utils/constants';
import { MapPin, Calendar, Car, User, CreditCard, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingDetail = () => {
  const { id } = useParams();
  const { data: booking, isLoading } = useGetBookingQuery(id);
  const { data: payment } = useGetPaymentByBookingQuery(id, { skip: !booking || booking.rideStatus !== 'Ride Completed' });
  const { data: feedback } = useGetFeedbackByBookingQuery(id, { skip: !payment });
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();

  if (isLoading) return <Loader />;
  if (!booking) return <p className="text-center py-12 text-surface-400">Booking not found.</p>;

  const ride = booking.interest?.rideRequest;
  const vehicle = booking.interest?.vehicle;
  const driver = vehicle?.driver;

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id).unwrap();
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title !mb-0">Booking Details</h1>
        <span className={`badge ${STATUS_COLORS[booking.rideStatus]}`}>
          {booking.rideStatus}
        </span>
      </div>

      {/* Route */}
      <div className="card mb-5">
        <h2 className="section-title flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-600" />
          </div>
          Route
        </h2>
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

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="card">
          <h2 className="section-title flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            Schedule
          </h2>
          <div className="space-y-1">
            <p className="text-sm text-surface-500">From: {formatDateTime(ride?.fromDateTime)}</p>
            <p className="text-sm text-surface-500">To: {formatDateTime(ride?.toDateTime)}</p>
            <p className="text-sm text-surface-500 mt-2">Passengers: {ride?.passengerCount}</p>
          </div>
          <p className="text-lg font-bold text-primary-600 mt-3">{formatCurrency(booking.interest?.estimatedCost)}</p>
        </div>

        <div className="card">
          <h2 className="section-title flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-600" />
            </div>
            Driver & Vehicle
          </h2>
          <div className="space-y-1">
            <p className="text-sm text-surface-800 font-medium">{driver?.fname} {driver?.lname}</p>
            <p className="text-sm text-surface-400">{driver?.email}</p>
            <p className="text-sm text-surface-500 mt-2">{vehicle?.companyName} {vehicle?.model}</p>
            <p className="text-sm text-surface-400">{vehicle?.vehicleNumber}</p>
          </div>
        </div>
      </div>

      {/* Payment info */}
      {payment && (
        <div className="card mb-5">
          <h2 className="section-title flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-600" />
            </div>
            Payment
          </h2>
          <div className="space-y-1">
            <p className="text-sm text-surface-600">Transaction ID: {payment.transactionId}</p>
            <p className="text-sm text-surface-600">Amount: {formatCurrency(payment.amount)}</p>
            <p className="text-sm text-surface-400">Paid: {formatDateTime(payment.paidAt)}</p>
          </div>
        </div>
      )}

      {/* Feedback info */}
      {feedback && (
        <div className="card mb-5">
          <h2 className="section-title flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            Feedback
          </h2>
          <p className="text-sm text-surface-500 italic">{feedback.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {booking.rideStatus === 'Ride Completed' && !payment && (
          <Link to={`/passenger/payment/${booking._id}`} className="btn-success">
            Make Payment
          </Link>
        )}
        {payment && !feedback && (
          <Link to={`/passenger/feedback/${booking._id}`} className="btn-primary">
            Leave Feedback
          </Link>
        )}
        {(booking.rideStatus === 'Ride Booked' || booking.rideStatus === 'In Progress') && (
          <button onClick={handleCancel} disabled={cancelling} className="btn-danger">
            {cancelling ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;

import { Play, Square, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStartRideMutation, useEndRideMutation, useCancelBookingMutation } from '../../features/rides/ridesApi';

const RideStatusPanel = ({ booking }) => {
  const [startRide, { isLoading: starting }] = useStartRideMutation();
  const [endRide, { isLoading: ending }] = useEndRideMutation();
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();

  const handleStart = async () => {
    try {
      await startRide(booking._id).unwrap();
      toast.success('Ride started!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to start ride');
    }
  };

  const handleEnd = async () => {
    try {
      await endRide(booking._id).unwrap();
      toast.success('Ride completed!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to end ride');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(booking._id).unwrap();
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {booking.rideStatus === 'Ride Booked' && (
        <>
          <button onClick={handleStart} disabled={starting} className="btn-primary flex items-center gap-1">
            <Play className="w-4 h-4" />
            {starting ? 'Starting...' : 'Start Ride'}
          </button>
          <button onClick={handleCancel} disabled={cancelling} className="btn-danger flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            {cancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        </>
      )}
      {booking.rideStatus === 'In Progress' && (
        <button onClick={handleEnd} disabled={ending} className="btn-success flex items-center gap-1">
          <Square className="w-4 h-4" />
          {ending ? 'Ending...' : 'End Ride'}
        </button>
      )}
    </div>
  );
};

export default RideStatusPanel;

import { useState } from 'react';
import { useGetMyBookingsQuery, useGetMyRideRequestsQuery, useCancelRideRequestMutation } from '../../features/rides/ridesApi';
import BookingCard from '../../components/passenger/BookingCard';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [tab, setTab] = useState('bookings');
  const { data: bookings, isLoading: loadingBookings } = useGetMyBookingsQuery();
  const { data: rides, isLoading: loadingRides } = useGetMyRideRequestsQuery();
  const [cancelRide] = useCancelRideRequestMutation();

  const handleCancelRide = async (id) => {
    if (!confirm('Cancel this ride request?')) return;
    try {
      await cancelRide(id).unwrap();
      toast.success('Ride request cancelled');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">My Rides & Bookings</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('bookings')}
          className={tab === 'bookings' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          Bookings ({bookings?.length || 0})
        </button>
        <button
          onClick={() => setTab('requests')}
          className={tab === 'requests' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          Ride Requests ({rides?.length || 0})
        </button>
      </div>

      {tab === 'bookings' && (
        loadingBookings ? <Loader /> : (
          bookings?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((b) => <BookingCard key={b._id} booking={b} />)}
            </div>
          ) : (
            <p className="text-surface-400 text-center py-12">No bookings yet.</p>
          )
        )
      )}

      {tab === 'requests' && (
        loadingRides ? <Loader /> : (
          rides?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rides.map((ride) => (
                <div key={ride._id} className="card-hover">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`badge ${STATUS_COLORS[ride.status]}`}>
                      {ride.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-surface-600">{ride.sourceAddress}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-surface-600">{ride.destinationAddress}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-surface-400 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(ride.fromDateTime)}</span>
                  </div>
                  <div className="flex gap-2">
                    {ride.status === 'Open' && (
                      <>
                        <Link to={`/passenger/interests/${ride._id}`} className="btn-primary text-sm">
                          View Interests
                        </Link>
                        <button onClick={() => handleCancelRide(ride._id)} className="btn-danger text-sm flex items-center gap-1">
                          <Trash2 className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-400 text-center py-12">No ride requests.</p>
          )
        )
      )}
    </div>
  );
};

export default Bookings;

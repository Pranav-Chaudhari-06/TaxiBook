import { useState } from 'react';
import { useGetDriverBookingsQuery, useGetMyInterestsQuery, useWithdrawInterestMutation } from '../../features/rides/ridesApi';
import Loader from '../../components/common/Loader';
import RideStatusPanel from '../../components/driver/RideStatusPanel';
import InterestCard from '../../components/driver/InterestCard';
import { MapPin } from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

const DriverBookings = () => {
  const [tab, setTab] = useState('bookings');
  const { data: bookings, isLoading: loadingBookings } = useGetDriverBookingsQuery();
  const { data: interests, isLoading: loadingInterests } = useGetMyInterestsQuery();
  const [withdrawInterest] = useWithdrawInterestMutation();

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw interest?')) return;
    try {
      await withdrawInterest(id).unwrap();
      toast.success('Interest withdrawn');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to withdraw');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">My Bookings & Interests</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('bookings')} className={tab === 'bookings' ? 'tab-btn-active' : 'tab-btn-inactive'}>
          Bookings ({bookings?.length || 0})
        </button>
        <button onClick={() => setTab('interests')} className={tab === 'interests' ? 'tab-btn-active' : 'tab-btn-inactive'}>
          My Interests ({interests?.length || 0})
        </button>
      </div>

      {tab === 'bookings' && (
        loadingBookings ? <Loader /> : bookings?.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {bookings.map((booking) => {
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
                  <p className="text-xs text-surface-400 mb-3">
                    {formatDateTime(ride?.fromDateTime)} &mdash; Passengers: {ride?.passengerCount}
                  </p>
                  <RideStatusPanel booking={booking} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-surface-400 py-12 text-center">No bookings yet.</div>
        )
      )}

      {tab === 'interests' && (
        loadingInterests ? <Loader /> : interests?.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interests.map((interest) => (
              <InterestCard key={interest._id} interest={interest} onWithdraw={handleWithdraw} />
            ))}
          </div>
        ) : (
          <div className="text-surface-400 py-12 text-center">No interests expressed.</div>
        )
      )}
    </div>
  );
};

export default DriverBookings;

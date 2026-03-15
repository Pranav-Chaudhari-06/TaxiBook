import { useParams, useNavigate } from 'react-router-dom';
import { useGetInterestsForRideQuery, useCreateBookingMutation } from '../../features/rides/ridesApi';
import DriverCard from '../../components/passenger/DriverCard';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const InterestPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { data: interests, isLoading } = useGetInterestsForRideQuery(rideId);
  const [createBooking, { isLoading: booking }] = useCreateBookingMutation();

  const handleSelect = async (interestId) => {
    if (!confirm('Confirm this driver for your ride?')) return;
    try {
      await createBooking({ interestId }).unwrap();
      toast.success('Booking confirmed!');
      navigate('/passenger/bookings');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to book');
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">Interested Drivers</h1>

      {interests?.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {interests.map((interest) => (
            <DriverCard key={interest._id} interest={interest} onSelect={handleSelect} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-surface-400">No drivers have expressed interest yet.</p>
          <p className="text-sm text-surface-400 mt-1">Check back later.</p>
        </div>
      )}
    </div>
  );
};

export default InterestPage;

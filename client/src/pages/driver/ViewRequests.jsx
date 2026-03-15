import { useState } from 'react';
import { useGetAvailableRidesQuery, useExpressInterestMutation, useGetMyVehicleQuery } from '../../features/rides/ridesApi';
import RideRequestList from '../../components/driver/RideRequestList';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ViewRequests = () => {
  const { data: rides, isLoading } = useGetAvailableRidesQuery();
  const { data: vehicle } = useGetMyVehicleQuery();
  const [expressInterest, { isLoading: expressing }] = useExpressInterestMutation();

  const [selectedRide, setSelectedRide] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState('');

  const handleExpressInterest = (rideId) => {
    if (!vehicle) {
      toast.error('Register a vehicle first');
      return;
    }
    setSelectedRide(rideId);
    setEstimatedCost('');
  };

  const handleConfirmInterest = async () => {
    if (!estimatedCost || isNaN(estimatedCost) || parseFloat(estimatedCost) <= 0) {
      toast.error('Enter a valid estimated cost');
      return;
    }
    try {
      await expressInterest({
        rideRequestId: selectedRide,
        estimatedCost: parseFloat(estimatedCost),
      }).unwrap();
      toast.success('Interest expressed!');
      setSelectedRide(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to express interest');
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">Available Ride Requests</h1>

      <RideRequestList rides={rides} onExpressInterest={handleExpressInterest} />

      <Modal
        isOpen={!!selectedRide}
        onClose={() => setSelectedRide(null)}
        title="Express Interest"
      >
        <div className="space-y-4">
          <p className="text-sm text-surface-500">
            Enter your estimated cost for this ride. The passenger will see this
            amount when choosing a driver.
          </p>
          <div>
            <label className="label">Estimated Cost (INR)</label>
            <input
              type="number"
              min="1"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className="input-field"
              placeholder="e.g. 500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmInterest}
              disabled={expressing}
              className="btn-primary"
            >
              {expressing ? 'Submitting...' : 'Confirm'}
            </button>
            <button onClick={() => setSelectedRide(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ViewRequests;

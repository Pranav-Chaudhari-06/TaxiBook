import { MapPin, Calendar, Users } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

const RideRequestList = ({ rides, onExpressInterest }) => {
  if (!rides || rides.length === 0) {
    return <div className="text-surface-400 py-12 text-center">No open ride requests available.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rides.map((ride) => (
        <div key={ride._id} className="card-hover">
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

          <div className="flex items-center gap-3 text-sm text-surface-400 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(ride.fromDateTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{ride.passengerCount}</span>
            </div>
          </div>

          <p className="text-xs text-surface-400 mb-3">
            By: {ride.passenger?.fname} {ride.passenger?.lname}
          </p>

          <button
            onClick={() => onExpressInterest(ride._id)}
            className="btn-primary w-full text-sm"
          >
            Express Interest
          </button>
        </div>
      ))}
    </div>
  );
};

export default RideRequestList;

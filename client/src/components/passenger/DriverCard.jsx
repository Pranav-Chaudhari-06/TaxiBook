import { User, Car, Fuel, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/formatDate';

const DriverCard = ({ interest, onSelect }) => {
  const driver = interest.vehicle?.driver;
  const vehicle = interest.vehicle;
  const fuel = vehicle?.fuelType;

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-surface-800">{driver?.fname} {driver?.lname}</p>
            <p className="text-xs text-surface-400">{driver?.email}</p>
          </div>
        </div>
        <span className="text-lg font-bold text-primary-600">
          {formatCurrency(interest.estimatedCost)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-surface-500 mb-4">
        <div className="flex items-center gap-1">
          <Car className="w-4 h-4" />
          <span>{vehicle?.companyName} {vehicle?.model}</span>
        </div>
        <div className="flex items-center gap-1">
          <Fuel className="w-4 h-4" />
          <span>{fuel?.fuelType}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>Capacity: {vehicle?.passengerCapacity}</span>
        </div>
        <div className="text-surface-400">
          {vehicle?.vehicleNumber}
        </div>
      </div>

      <button onClick={() => onSelect(interest._id)} className="btn-primary w-full">
        Select Driver
      </button>
    </div>
  );
};

export default DriverCard;

import { MapPin, Calendar, Trash2 } from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../utils/constants';

const InterestCard = ({ interest, onWithdraw }) => {
  const ride = interest.rideRequest;

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <span className={`badge ${STATUS_COLORS[ride?.status] || 'bg-surface-100 text-surface-600'}`}>
          {ride?.status}
        </span>
        <span className="text-lg font-bold text-primary-600">{formatCurrency(interest.estimatedCost)}</span>
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

      <div className="flex items-center gap-1 text-sm text-surface-400 mb-3">
        <Calendar className="w-4 h-4" />
        <span>{formatDateTime(ride?.fromDateTime)}</span>
      </div>

      {ride?.status === 'Open' && onWithdraw && (
        <button
          onClick={() => onWithdraw(interest._id)}
          className="btn-danger text-sm flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Withdraw Interest
        </button>
      )}
    </div>
  );
};

export default InterestCard;

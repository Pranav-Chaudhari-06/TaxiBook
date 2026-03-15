import { useState } from 'react';
import { useGetRidesQuery } from '../../features/admin/adminApi';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../utils/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminRides = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useGetRidesQuery({ page, status });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">All Ride Requests</h1>

      <div className="card mb-4">
        <div className="flex gap-2">
          {['', 'Open', 'Booked', 'Cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={status === s ? 'tab-btn-active' : 'tab-btn-inactive'}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {isLoading ? <Loader /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-header">Passenger</th>
                    <th className="table-header">Source</th>
                    <th className="table-header">Destination</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.rides?.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-surface-400 text-center py-12">No rides found.</td>
                    </tr>
                  )}
                  {data?.rides?.map((ride) => (
                    <tr key={ride._id} className="table-row">
                      <td className="table-cell font-medium text-surface-800">{ride.passenger?.fname} {ride.passenger?.lname}</td>
                      <td className="table-cell text-surface-500 max-w-[200px] truncate">{ride.sourceAddress}</td>
                      <td className="table-cell text-surface-500 max-w-[200px] truncate">{ride.destinationAddress}</td>
                      <td className="table-cell text-surface-500">{formatDateTime(ride.fromDateTime)}</td>
                      <td className="table-cell">
                        <span className={`badge ${STATUS_COLORS[ride.status]}`}>{ride.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data?.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-surface-400">Page {data.page} of {data.pages} ({data.total} total)</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="btn-secondary text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4" />Prev</button>
                  <button onClick={() => setPage(page + 1)} disabled={page >= data.pages} className="btn-secondary text-sm flex items-center gap-1">Next<ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRides;

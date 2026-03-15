import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const UserTable = ({ users, total, page, pages, onPageChange, onDelete, type = 'passenger' }) => {
  if (!users || users.length === 0) {
    return <p className="text-surface-400 text-center py-12">No {type}s found.</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Contact</th>
              <th className="table-header">City</th>
              <th className="table-header">Joined</th>
              <th className="table-header">Verified</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="table-row">
                <td className="table-cell font-medium text-surface-800">{user.fname} {user.lname}</td>
                <td className="table-cell text-surface-500">{user.email}</td>
                <td className="table-cell text-surface-500">{user.contact || '-'}</td>
                <td className="table-cell text-surface-500">{user.city?.cityName || '-'}</td>
                <td className="table-cell text-surface-500">{formatDate(user.createdAt)}</td>
                <td className="table-cell">
                  <span className={`badge ${user.isVerified ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                    {user.isVerified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="table-cell">
                  <button
                    onClick={() => onDelete(user._id)}
                    className="p-2 rounded-xl text-surface-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-surface-400">
            Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;

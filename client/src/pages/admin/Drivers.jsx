import { useState } from 'react';
import { useGetDriversQuery, useDeleteDriverMutation } from '../../features/admin/adminApi';
import UserTable from '../../components/admin/UserTable';
import Loader from '../../components/common/Loader';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Drivers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetDriversQuery({ page, search });
  const [deleteDriver] = useDeleteDriverMutation();

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver and their vehicle?')) return;
    try {
      await deleteDriver(id).unwrap();
      toast.success('Driver deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">Drivers</h1>

      <div className="card mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10"
            placeholder="Search by name or email..."
          />
        </div>
      </div>

      <div className="card">
        {isLoading ? <Loader /> : (
          <UserTable
            users={data?.drivers}
            total={data?.total}
            page={data?.page}
            pages={data?.pages}
            onPageChange={setPage}
            onDelete={handleDelete}
            type="driver"
          />
        )}
      </div>
    </div>
  );
};

export default Drivers;

import { Users, Car, CheckCircle, DollarSign, UserPlus } from 'lucide-react';
import { useGetStatsQuery } from '../../features/admin/adminApi';
import StatsCard from '../../components/admin/StatsCard';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatDate';

const Dashboard = () => {
  const { data: stats, isLoading } = useGetStatsQuery();

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard title="Total Passengers" value={stats?.totalPassengers || 0} icon={Users} color="primary" />
        <StatsCard title="Total Drivers" value={stats?.totalDrivers || 0} icon={Car} color="green" />
        <StatsCard title="New This Month" value={stats?.newRegistrationsThisMonth || 0} icon={UserPlus} color="purple" />
        <StatsCard title="Rides Completed" value={stats?.totalRidesCompleted || 0} icon={CheckCircle} color="yellow" />
        <StatsCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="green" />
      </div>
    </div>
  );
};

export default Dashboard;

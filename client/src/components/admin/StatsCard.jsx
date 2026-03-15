const StatsCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const colorMap = {
    primary: 'from-primary-100 to-primary-50 text-primary-600',
    green: 'from-emerald-100 to-emerald-50 text-emerald-600',
    yellow: 'from-amber-100 to-amber-50 text-amber-600',
    red: 'from-red-100 to-red-50 text-red-600',
    purple: 'from-purple-100 to-purple-50 text-purple-600',
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center ${colorMap[color]}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-sm font-medium text-surface-400">{title}</p>
        <p className="text-3xl font-extrabold text-surface-800">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;

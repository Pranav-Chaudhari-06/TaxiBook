import { Loader2 } from 'lucide-react';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary-100" />
        <Loader2 className="absolute inset-0 w-12 h-12 text-primary-600 animate-spin" />
      </div>
      <p className="mt-4 text-surface-400 text-sm font-medium">{text}</p>
    </div>
  );
};

export default Loader;
